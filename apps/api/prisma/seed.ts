import { BookingStatus, ClassType, Gender, PassengerType, PaymentMethod, PaymentStatus, PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

const airports = [
  { code: 'HAN', name: 'Sân bay Quốc tế Nội Bài', city: 'Hà Nội' },
  { code: 'SGN', name: 'Sân bay Quốc tế Tân Sơn Nhất', city: 'TP. Hồ Chí Minh' },
  { code: 'DAD', name: 'Sân bay Quốc tế Đà Nẵng', city: 'Đà Nẵng' },
  { code: 'PQC', name: 'Sân bay Quốc tế Phú Quốc', city: 'Phú Quốc' },
  { code: 'CXR', name: 'Sân bay Quốc tế Cam Ranh', city: 'Nha Trang' },
  { code: 'HUI', name: 'Sân bay Quốc tế Phú Bài', city: 'Huế' },
  { code: 'VCA', name: 'Sân bay Quốc tế Cần Thơ', city: 'Cần Thơ' },
  { code: 'DLI', name: 'Sân bay Liên Khương', city: 'Đà Lạt' },
  { code: 'VII', name: 'Sân bay Quốc tế Vinh', city: 'Vinh' },
  { code: 'VDH', name: 'Sân bay Đồng Hới', city: 'Đồng Hới' },
  { code: 'UIH', name: 'Sân bay Phù Cát', city: 'Quy Nhơn' },
  { code: 'VDO', name: 'Sân bay Quốc tế Vân Đồn', city: 'Quảng Ninh' }
];

const airlines = [
  { code: 'VN', name: 'Vietnam Airlines', logo: '/airlines/vietnam-airlines.svg' },
  { code: 'VJ', name: 'VietJet Air', logo: '/airlines/vietjet.svg' },
  { code: 'QH', name: 'Bamboo Airways', logo: '/airlines/bamboo.svg' },
  { code: 'VU', name: 'Vietravel Airlines', logo: '/airlines/vietravel.svg' },
  { code: 'BL', name: 'Pacific Airlines', logo: '/airlines/pacific.svg' }
];

const routePairs: Array<[string, string, number]> = [
  ['HAN', 'SGN', 1160],
  ['HAN', 'DAD', 606],
  ['HAN', 'PQC', 1240],
  ['HAN', 'CXR', 1080],
  ['HAN', 'HUI', 550],
  ['HAN', 'DLI', 1085],
  ['HAN', 'VII', 280],
  ['HAN', 'VDH', 420],
  ['HAN', 'UIH', 880],
  ['HAN', 'VDO', 160],
  ['SGN', 'DAD', 605],
  ['SGN', 'PQC', 300],
  ['SGN', 'CXR', 310],
  ['SGN', 'HUI', 635],
  ['SGN', 'VCA', 125],
  ['SGN', 'DLI', 230],
  ['SGN', 'VII', 885],
  ['SGN', 'VDH', 745],
  ['SGN', 'UIH', 435],
  ['DAD', 'PQC', 790],
  ['DAD', 'CXR', 520],
  ['DAD', 'DLI', 475],
  ['DAD', 'VCA', 720],
  ['CXR', 'PQC', 620]
];

const flightSlots = [
  { hour: 6, minute: 15, aircraft: 'Airbus A320' },
  { hour: 8, minute: 40, aircraft: 'Airbus A321' },
  { hour: 11, minute: 25, aircraft: 'Airbus A321neo' },
  { hour: 14, minute: 10, aircraft: 'Boeing 787' },
  { hour: 17, minute: 35, aircraft: 'Airbus A320' },
  { hour: 20, minute: 5, aircraft: 'Airbus A321' }
];

const bookingContacts = [
  ['Nguyễn Minh Anh', 'minhanh@test.vn', '0901000001'],
  ['Trần Hoàng Nam', 'hoangnam@test.vn', '0901000002'],
  ['Lê Phương Thảo', 'phuongthao@test.vn', '0901000003'],
  ['Phạm Gia Huy', 'giahuy@test.vn', '0901000004'],
  ['Đỗ Khánh Linh', 'khanhlinh@test.vn', '0901000005'],
  ['Võ Quốc Bảo', 'quocbao@test.vn', '0901000006']
] as const;

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function setTime(date: Date, hour: number, minute: number) {
  const next = new Date(date);
  next.setHours(hour, minute, 0, 0);
  return next;
}

function bookingCode(index: number) {
  return `VF-${index.toString(36).toUpperCase().padStart(6, '0')}`;
}

function ticketNumber(index: number) {
  return `738${String(880000000 + index)}`;
}

async function resetDatabase() {
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.savedPassenger.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.flightClass.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.agencyMarkupRule.deleteMany();
  await prisma.route.deleteMany();
  await prisma.airport.deleteMany();
  await prisma.airline.deleteMany();
  await prisma.user.deleteMany();
}

async function seedCatalog() {
  const airportMap = new Map<string, string>();
  for (const airport of airports) {
    const created = await prisma.airport.create({ data: airport });
    airportMap.set(airport.code, created.id);
  }

  const airlineMap = new Map<string, string>();
  for (const airline of airlines) {
    const created = await prisma.airline.create({ data: airline });
    airlineMap.set(airline.code, created.id);
  }

  const routeMap = new Map<string, { id: string; distanceKm: number }>();
  for (const [from, to, distanceKm] of routePairs) {
    for (const [departureCode, arrivalCode] of [[from, to], [to, from]]) {
      const route = await prisma.route.create({
        data: {
          departureId: airportMap.get(departureCode)!,
          arrivalId: airportMap.get(arrivalCode)!,
          distanceKm
        }
      });
      routeMap.set(`${departureCode}-${arrivalCode}`, { id: route.id, distanceKm });
    }
  }

  await prisma.agencyMarkupRule.createMany({
    data: [
      { name: 'Hoa hồng mặc định đại lý', percent: 7, fixedVND: 50000, priority: 1 },
      { name: 'Hoa hồng Vietnam Airlines', airlineCode: 'VN', percent: 5, fixedVND: 70000, priority: 3 },
      { name: 'Hoa hồng thương gia', classType: ClassType.BUSINESS, percent: 4, fixedVND: 150000, priority: 2 }
    ]
  });

  return { airlineMap, routeMap };
}

async function seedFlights(airlineMap: Map<string, string>, routeMap: Map<string, { id: string; distanceKm: number }>) {
  const today = new Date();
  let flightIndex = 1;

  for (let day = 1; day <= 75; day += 1) {
    const date = addDays(today, day);
    let routeIndex = 0;

    for (const [routeKey, route] of routeMap.entries()) {
      const dailySlots = route.distanceKm > 900 ? flightSlots.slice(0, 5) : flightSlots;

      for (let slotIndex = 0; slotIndex < dailySlots.length; slotIndex += 1) {
        const slot = dailySlots[slotIndex];
        const airline = airlines[(day + routeIndex + slotIndex) % airlines.length];
        const departureTime = setTime(date, slot.hour, slot.minute);
        const durationMin = route.distanceKm > 1000 ? 135 : route.distanceKm > 600 ? 95 : route.distanceKm > 250 ? 65 : 45;
        const arrivalTime = new Date(departureTime.getTime() + durationMin * 60 * 1000);
        const economyBase = 680000 + Math.round(route.distanceKm * 620) + day * 2500 + slotIndex * 45000;
        const businessBase = economyBase * 3 + 900000;

        await prisma.flight.create({
          data: {
            providerRef: `seed-${routeKey}-${day}-${slotIndex}`,
            flightNumber: `${airline.code}${String(100 + ((flightIndex * 7) % 890)).padStart(3, '0')}`,
            airlineId: airlineMap.get(airline.code)!,
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
                  availableSeats: 90 + ((flightIndex + day) % 70),
                  basePriceVND: BigInt(economyBase),
                  flightTaxVND: BigInt(180000),
                  baggageKg: airline.code === 'VJ' ? 0 : 23
                },
                {
                  classType: ClassType.PREMIUM_ECONOMY,
                  totalSeats: 32,
                  availableSeats: 12 + (flightIndex % 15),
                  basePriceVND: BigInt(Math.round(economyBase * 1.65)),
                  flightTaxVND: BigInt(220000),
                  baggageKg: 23
                },
                {
                  classType: ClassType.BUSINESS,
                  totalSeats: 16,
                  availableSeats: 4 + (flightIndex % 9),
                  basePriceVND: BigInt(businessBase),
                  flightTaxVND: BigInt(280000),
                  baggageKg: 32
                }
              ]
            }
          }
        });

        flightIndex += 1;
      }

      routeIndex += 1;
    }
  }
}

async function seedUsers() {
  const users: Array<[string, string, Role, string]> = [
    ['admin@vietfly.vn', 'Admin@123456', Role.ADMIN, 'Quản trị VietFly'],
    ['manager@vietfly.vn', 'Manager@123456', Role.MANAGER, 'Quản lý đại lý'],
    ['staff@vietfly.vn', 'Staff@123456', Role.STAFF, 'Nhân viên bán vé'],
    ['customer@test.vn', 'Customer@123456', Role.CUSTOMER, 'Khách hàng thử nghiệm']
  ];

  const createdUsers = [];
  for (const [email, password, role, fullName] of users) {
    createdUsers.push(
      await prisma.user.create({
        data: {
          email,
          fullName,
          role,
          isVerified: true,
          password: await bcrypt.hash(password, 12)
        }
      })
    );
  }

  await prisma.savedPassenger.createMany({
    data: [
      { userId: createdUsers[3].id, firstName: 'Minh Anh', lastName: 'Nguyễn', gender: Gender.FEMALE, idNumber: '001200000001' },
      { userId: createdUsers[3].id, firstName: 'Gia Huy', lastName: 'Phạm', gender: Gender.MALE, idNumber: '001200000002' }
    ]
  });

  return createdUsers[3].id;
}

async function seedPromotions() {
  const now = new Date();
  await prisma.promotion.createMany({
    data: [
      {
        code: 'BAYNGAY',
        name: 'Bay ngay giảm 5%',
        description: 'Giảm 5% cho mọi tuyến nội địa',
        discountType: 'PERCENTAGE',
        discountValue: 5,
        minOrderVND: BigInt(1200000),
        maxDiscountVND: BigInt(250000),
        startDate: addDays(now, -7),
        endDate: addDays(now, 45),
        isActive: true
      },
      {
        code: 'DAILY100',
        name: 'Giảm 100.000đ',
        description: 'Ưu đãi cố định cho đơn từ 1.500.000đ',
        discountType: 'FIXED_AMOUNT',
        discountValue: 100000,
        minOrderVND: BigInt(1500000),
        startDate: addDays(now, -3),
        endDate: addDays(now, 30),
        isActive: true
      }
    ]
  });
}

async function seedBookings(customerId: string) {
  const flights = await prisma.flight.findMany({
    take: 90,
    orderBy: { departureTime: 'asc' },
    include: { classes: true }
  });
  const statuses = [BookingStatus.PENDING, BookingStatus.PAID, BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.EXPIRED, BookingStatus.REFUNDED];
  let bookingIndex = 1;

  for (const flight of flights) {
    const flightClass = flight.classes.find((item) => item.classType === ClassType.ECONOMY);
    if (!flightClass) continue;

    const passengerCount = bookingIndex % 5 === 0 ? 2 : 1;
    const basePerPassenger = Number(flightClass.basePriceVND) + Number(flightClass.flightTaxVND);
    const baseAmount = basePerPassenger * passengerCount;
    const markup = Math.round(baseAmount * 0.07) + 50000;
    const status = statuses[bookingIndex % statuses.length];
    const contact = bookingContacts[bookingIndex % bookingContacts.length];

    const booking = await prisma.booking.create({
      data: {
        bookingCode: bookingCode(bookingIndex),
        userId: bookingIndex % 3 === 0 ? customerId : undefined,
        flightId: flight.id,
        status,
        contactName: contact[0],
        contactEmail: contact[1],
        contactPhone: contact[2],
        baseAmountVND: BigInt(baseAmount),
        markupVND: BigInt(markup),
        discountVND: bookingIndex % 7 === 0 ? BigInt(100000) : BigInt(0),
        totalAmountVND: BigInt(baseAmount + markup - (bookingIndex % 7 === 0 ? 100000 : 0)),
        providerPnr: `PNR${String(700000 + bookingIndex)}`,
        paidAt: status === BookingStatus.PAID || status === BookingStatus.CONFIRMED ? addDays(new Date(), -1) : undefined,
        cancelledAt: status === BookingStatus.CANCELLED ? new Date() : undefined,
        cancelReason: status === BookingStatus.CANCELLED ? 'Khách yêu cầu đổi lịch bay' : undefined,
        items: {
          create: Array.from({ length: passengerCount }, (_, passengerIndex) => ({
            flightClassId: flightClass.id,
            passengerType: passengerIndex === 0 ? PassengerType.ADULT : PassengerType.CHILD,
            firstName: passengerIndex === 0 ? 'Minh Anh' : 'Gia Huy',
            lastName: passengerIndex === 0 ? 'Nguyễn' : 'Phạm',
            gender: passengerIndex === 0 ? Gender.FEMALE : Gender.MALE,
            nationality: 'VN',
            idNumber: `00120${String(bookingIndex).padStart(7, '0')}${passengerIndex}`,
            baggageExtraKg: passengerIndex === 0 && bookingIndex % 4 === 0 ? 15 : 0,
            priceVND: BigInt(basePerPassenger)
          }))
        }
      },
      include: { items: true }
    });

    if (status !== BookingStatus.PENDING && status !== BookingStatus.EXPIRED) {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          method: bookingIndex % 4 === 0 ? PaymentMethod.BANK_TRANSFER : PaymentMethod.VNPAY,
          gateway: bookingIndex % 4 === 0 ? 'bank_transfer' : 'vnpay',
          gatewayTxId: `TX${Date.now()}${bookingIndex}`,
          amountVND: booking.totalAmountVND,
          status: status === BookingStatus.REFUNDED ? PaymentStatus.REFUNDED : status === BookingStatus.CANCELLED ? PaymentStatus.FAILED : PaymentStatus.SUCCESS,
          paidAt: status === BookingStatus.CANCELLED ? undefined : addDays(new Date(), -1),
          refundedAt: status === BookingStatus.REFUNDED ? new Date() : undefined,
          refundAmountVND: status === BookingStatus.REFUNDED ? booking.totalAmountVND : undefined
        }
      });
    }

    if (status === BookingStatus.CONFIRMED) {
      for (let itemIndex = 0; itemIndex < booking.items.length; itemIndex += 1) {
        await prisma.ticket.create({
          data: {
            bookingId: booking.id,
            bookingItemId: booking.items[itemIndex].id,
            ticketNumber: ticketNumber(bookingIndex * 10 + itemIndex),
            pnrCode: booking.providerPnr,
            pdfUrl: `/tickets/${booking.bookingCode}.pdf`
          }
        });
      }
    }

    bookingIndex += 1;
  }
}

async function main() {
  await resetDatabase();
  const { airlineMap, routeMap } = await seedCatalog();
  await seedFlights(airlineMap, routeMap);
  const customerId = await seedUsers();
  await seedPromotions();
  await seedBookings(customerId);

  const [flightCount, bookingCount] = await Promise.all([
    prisma.flight.count(),
    prisma.booking.count()
  ]);
  console.log(`Seed complete: ${flightCount} flights, ${bookingCount} bookings.`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
