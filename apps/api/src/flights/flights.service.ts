import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ClassType, FlightStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { calculateMarkup, toNumber } from '../common/utils/money';
import { SearchFlightsDto } from './dto/search-flights.dto';

@Injectable()
export class FlightsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(dto: SearchFlightsDto) {
    if (dto.from.toUpperCase() === dto.to.toUpperCase()) {
      throw new BadRequestException('Điểm đi và điểm đến không được trùng nhau.');
    }

    const start = new Date(`${dto.date}T00:00:00.000Z`);
    const end = new Date(`${dto.date}T23:59:59.999Z`);
    const passengerCount = dto.adults + dto.children + dto.infants;

    let flights = await this.findFlights(dto, start, end, passengerCount);
    if (flights.length === 0) {
      await this.createDemoFlightsForSearch(dto);
      flights = await this.findFlights(dto, start, end, passengerCount);
    }

    const rows = await Promise.all(
      flights.map(async (flight) => {
        const flightClass = flight.classes.find((item) => item.classType === (dto.classType ?? ClassType.ECONOMY));
        if (!flightClass) return null;
        const basePrice = toNumber(flightClass.basePriceVND) + toNumber(flightClass.flightTaxVND);
        const rule = await this.findBestMarkupRule(flight.airline.code, flight.routeId, flightClass.classType);
        const markup = calculateMarkup(basePrice, Number(rule?.percent ?? 0), toNumber(rule?.fixedVND ?? 0));

        return {
          id: flight.id,
          flightNumber: flight.flightNumber,
          airline: flight.airline,
          route: flight.route,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          durationMin: flight.durationMin,
          aircraft: flight.aircraft,
          classType: flightClass.classType,
          availableSeats: flightClass.availableSeats,
          baggageKg: flightClass.baggageKg,
          basePriceVND: basePrice,
          markupVND: markup,
          displayPriceVND: basePrice + markup
        };
      })
    );

    const result = rows.filter(Boolean);
    return result.sort((a, b) => {
      if (!a || !b) return 0;
      if (dto.sortBy === 'duration') return a.durationMin - b.durationMin;
      if (dto.sortBy === 'departure') return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      return a.displayPriceVND - b.displayPriceVND;
    });
  }

  private findFlights(dto: SearchFlightsDto, start: Date, end: Date, passengerCount: number) {
    return this.prisma.flight.findMany({
      where: {
        departureTime: { gte: start, lte: end },
        status: FlightStatus.SCHEDULED,
        airline: dto.airline ? { code: dto.airline } : undefined,
        route: {
          departure: { code: dto.from.toUpperCase() },
          arrival: { code: dto.to.toUpperCase() }
        },
        classes: {
          some: {
            classType: dto.classType ?? ClassType.ECONOMY,
            availableSeats: { gte: passengerCount }
          }
        }
      },
      include: {
        airline: true,
        route: { include: { departure: true, arrival: true } },
        classes: true
      }
    });
  }

  async findById(id: string) {
    const flight = await this.prisma.flight.findUnique({
      where: { id },
      include: {
        airline: true,
        route: { include: { departure: true, arrival: true } },
        classes: true
      }
    });
    if (!flight) throw new NotFoundException('Không tìm thấy chuyến bay.');
    return flight;
  }

  async getSeats(flightId: string) {
    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
      include: { 
        classes: true,
        airline: true
      }
    });
    if (!flight) throw new NotFoundException('Không tìm thấy chuyến bay.');

    const bookings = await this.prisma.booking.findMany({
      where: { flightId, status: { not: 'CANCELLED' } },
      include: { items: true }
    });

    const occupiedSeats = bookings.flatMap((b) => b.items.map((i) => i.seatNumber).filter(Boolean));

    // Fetch Airline-Specific Configurations
    const [dbSeatTiers, dbBaggageOptions, dbExtraServices] = await Promise.all([
      this.prisma.seatTier.findMany({ where: { airlineId: flight.airlineId } }),
      this.prisma.baggageOption.findMany({ where: { airlineId: flight.airlineId }, orderBy: { weightKg: 'asc' } }),
      this.prisma.extraService.findMany({ where: { airlineId: flight.airlineId } })
    ]);

    // Default Tiers if not configured
    const seatTiers = dbSeatTiers.length > 0 ? dbSeatTiers.map((t) => ({
      name: t.name,
      priceVND: toNumber(t.priceVND),
      rows: t.rowRange?.split(',').flatMap((r) => {
        if (r.includes('-')) {
          const [start, end] = r.split('-').map(Number);
          return Array.from({ length: end - start + 1 }, (_, i) => i + start);
        }
        return [Number(r)];
      }) || [],
      color: t.color || '#cbd5e1'
    })) : [
      { name: 'Standard', priceVND: 0, rows: Array.from({ length: 21 }, (_, i) => i + 10), color: '#cbd5e1' },
      { name: 'Preferred', priceVND: 50000, rows: [5, 6, 7, 8, 9], color: '#3b82f6' },
      { name: 'Extra Legroom', priceVND: 150000, rows: [1, 2, 3, 4], color: '#f59e0b' }
    ];

    const baggageOptions = dbBaggageOptions.length > 0 ? dbBaggageOptions.map((b) => ({
      id: b.id,
      weightKg: b.weightKg,
      priceVND: toNumber(b.priceVND)
    })) : [
      { id: 'def-bg-1', weightKg: 15, priceVND: 180000 },
      { id: 'def-bg-2', weightKg: 20, priceVND: 250000 }
    ];

    const extraServices = dbExtraServices.length > 0 ? dbExtraServices.map((s) => ({
      id: s.id,
      name: s.name,
      priceVND: toNumber(s.priceVND),
      category: s.category
    })) : [
      { id: 'def-sv-1', name: 'Suất ăn nóng', priceVND: 65000, category: 'MEAL' }
    ];

    // Simple layout generation based on aircraft type
    const layout = {
      rows: 30,
      cols: ['A', 'B', 'C', 'D', 'E', 'F'],
      aisleAfter: [3]
    };

    return { layout, occupiedSeats, seatTiers, baggageOptions, extraServices };
  }

  async listAirports() {
    return this.prisma.airport.findMany({ orderBy: [{ city: 'asc' }, { code: 'asc' }] });
  }

  async listAirlines() {
    return this.prisma.airline.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  async findAll() {
    return this.prisma.flight.findMany({
      include: {
        airline: true,
        route: { include: { departure: true, arrival: true } },
        classes: true
      },
      orderBy: { departureTime: 'desc' }
    });
  }

  private findBestMarkupRule(airlineCode: string, routeId: string, classType: ClassType) {
    return this.prisma.agencyMarkupRule.findFirst({
      where: {
        isActive: true,
        OR: [
          { airlineCode, routeId, classType },
          { airlineCode, routeId, classType: null },
          { airlineCode, routeId: null, classType },
          { airlineCode: null, routeId, classType },
          { airlineCode: null, routeId: null, classType: null }
        ]
      },
      orderBy: { priority: 'desc' }
    });
  }

  private async createDemoFlightsForSearch(dto: SearchFlightsDto) {
    await this.ensureBaseCatalog();

    let route = await this.prisma.route.findFirst({
      where: {
        departure: { code: dto.from.toUpperCase() },
        arrival: { code: dto.to.toUpperCase() },
        isActive: true
      }
    });
    if (!route) {
      const [departure, arrival] = await Promise.all([
        this.prisma.airport.findUnique({ where: { code: dto.from.toUpperCase() } }),
        this.prisma.airport.findUnique({ where: { code: dto.to.toUpperCase() } })
      ]);
      if (!departure || !arrival) return;
      route = await this.prisma.route.create({
        data: {
          departureId: departure.id,
          arrivalId: arrival.id,
          distanceKm: 900
        }
      });
    }
    if (!route) return;

    const airlines = await this.prisma.airline.findMany({
      where: dto.airline ? { code: dto.airline.toUpperCase(), isActive: true } : { isActive: true },
      orderBy: { code: 'asc' }
    });
    if (airlines.length === 0) return;

    const times = [
      { hour: 7, minute: 20, aircraft: 'Airbus A321' },
      { hour: 10, minute: 35, aircraft: 'Airbus A320neo' },
      { hour: 15, minute: 45, aircraft: 'Boeing 787' }
    ];
    const durationMin = route.distanceKm && route.distanceKm > 900 ? 130 : 85;

    for (let index = 0; index < times.length; index += 1) {
      const airline = airlines[index % airlines.length];
      const slot = times[index];
      const departureTime = new Date(`${dto.date}T${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')}:00+07:00`);
      const arrivalTime = new Date(departureTime.getTime() + durationMin * 60 * 1000);

      await this.prisma.flight.create({
        data: {
          providerRef: `mock-${dto.from}-${dto.to}-${dto.date}-${index}`,
          flightNumber: `${airline.code}${310 + index}`,
          airlineId: airline.id,
          routeId: route.id,
          departureTime,
          arrivalTime,
          durationMin,
          aircraft: slot.aircraft,
          classes: {
            create: [
              {
                classType: ClassType.ECONOMY,
                totalSeats: 180,
                availableSeats: 72 - index * 8,
                basePriceVND: BigInt(920000 + index * 140000),
                flightTaxVND: BigInt(190000),
                baggageKg: airline.code === 'VJ' ? 0 : 23
              },
              {
                classType: ClassType.BUSINESS,
                totalSeats: 16,
                availableSeats: 8,
                basePriceVND: BigInt(3100000 + index * 260000),
                flightTaxVND: BigInt(280000),
                baggageKg: 32
              }
            ]
          }
        }
      });
    }
  }

  private async ensureBaseCatalog() {
    const airports = [
      { code: 'HAN', name: 'Sân bay Quốc tế Nội Bài', city: 'Hà Nội' },
      { code: 'SGN', name: 'Sân bay Quốc tế Tân Sơn Nhất', city: 'TP. Hồ Chí Minh' },
      { code: 'DAD', name: 'Sân bay Quốc tế Đà Nẵng', city: 'Đà Nẵng' },
      { code: 'PQC', name: 'Sân bay Quốc tế Phú Quốc', city: 'Phú Quốc' }
    ];
    const airlines = [
      { code: 'VN', name: 'Vietnam Airlines', logo: '/airlines/vietnam-airlines.svg' },
      { code: 'VJ', name: 'VietJet Air', logo: '/airlines/vietjet.svg' },
      { code: 'QH', name: 'Bamboo Airways', logo: '/airlines/bamboo.svg' }
    ];

    await Promise.all(
      airports.map((airport) =>
        this.prisma.airport.upsert({
          where: { code: airport.code },
          create: airport,
          update: airport
        })
      )
    );
    await Promise.all(
      airlines.map((airline) =>
        this.prisma.airline.upsert({
          where: { code: airline.code },
          create: airline,
          update: airline
        })
      )
    );

    const routePairs = [
      ['HAN', 'SGN', 1160],
      ['SGN', 'HAN', 1160],
      ['HAN', 'DAD', 606],
      ['DAD', 'SGN', 605],
      ['SGN', 'PQC', 300],
      ['HAN', 'PQC', 1240]
    ] as const;

    for (const [from, to, distanceKm] of routePairs) {
      const departure = await this.prisma.airport.findUniqueOrThrow({ where: { code: from } });
      const arrival = await this.prisma.airport.findUniqueOrThrow({ where: { code: to } });
      await this.prisma.route.upsert({
        where: { departureId_arrivalId: { departureId: departure.id, arrivalId: arrival.id } },
        create: { departureId: departure.id, arrivalId: arrival.id, distanceKm },
        update: { distanceKm, isActive: true }
      });
    }

    await this.prisma.agencyMarkupRule.upsert({
      where: { id: 'default-agency-markup' },
      create: {
        id: 'default-agency-markup',
        name: 'Hoa hồng mặc định đại lý',
        percent: 7,
        fixedVND: 50000,
        priority: 1
      },
      update: {
        percent: 7,
        fixedVND: 50000,
        isActive: true,
        priority: 1
      }
    });
  }
}
