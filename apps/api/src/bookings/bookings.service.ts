import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DiscountType } from '@prisma/client';
import { randomBytes } from 'crypto';
import { MockAirlineProvider } from '../common/providers/mock-airline.provider';
import { calculateMarkup, formatBookingCode, toNumber } from '../common/utils/money';
import { PrismaService } from '../prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

function randomCode(length = 6) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(randomBytes(length), (byte) => alphabet[byte % alphabet.length]).join('');
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly airlineProvider: MockAirlineProvider
  ) {}

  async create(dto: CreateBookingDto) {
    const flight = await this.prisma.flight.findUnique({
      where: { id: dto.flightId },
      include: {
        airline: true,
        route: true,
        classes: true
      }
    });
    if (!flight) throw new NotFoundException('Không tìm thấy chuyến bay.');

    const flightClass = flight.classes.find((item) => item.classType === dto.classType);
    if (!flightClass) throw new BadRequestException('Hạng ghế không hợp lệ.');
    if (flightClass.availableSeats < dto.passengers.length) throw new BadRequestException('Không đủ ghế trống cho số hành khách đã chọn.');

    const perPassengerBase = toNumber(flightClass.basePriceVND) + toNumber(flightClass.flightTaxVND);
    const baseAmount = perPassengerBase * dto.passengers.length;
    const rule = await this.prisma.agencyMarkupRule.findFirst({
      where: { isActive: true },
      orderBy: { priority: 'desc' }
    });
    const markup = calculateMarkup(baseAmount, Number(rule?.percent ?? 0), toNumber(rule?.fixedVND ?? 0));
    const discount = await this.calculatePromotionDiscount(dto.promotionCode, baseAmount + markup);
    const hold = await this.airlineProvider.holdSeats(dto.flightId, dto.passengers.length);
    const user = dto.userId
      ? await this.prisma.user.findUnique({ where: { id: dto.userId } })
      : await this.prisma.user.findUnique({ where: { email: dto.contactEmail } });

    return this.prisma.$transaction(async (tx) => {
      await tx.flightClass.update({
        where: { id: flightClass.id },
        data: { availableSeats: { decrement: dto.passengers.length } }
      });

      return tx.booking.create({
        data: {
          bookingCode: formatBookingCode(randomCode()),
          userId: user?.id,
          flightId: dto.flightId,
          contactName: dto.contactName,
          contactEmail: dto.contactEmail,
          contactPhone: dto.contactPhone,
          baseAmountVND: baseAmount,
          markupVND: markup,
          discountVND: discount.amount,
          totalAmountVND: baseAmount + markup - discount.amount,
          providerPnr: hold.pnrCode,
          items: {
            create: dto.passengers.map((passenger) => ({
              flightClassId: flightClass.id,
              passengerType: passenger.passengerType,
              firstName: passenger.firstName,
              lastName: passenger.lastName,
              gender: passenger.gender,
              idNumber: passenger.idNumber,
              priceVND: perPassengerBase
            }))
          }
        },
        include: {
          flight: { include: { airline: true, route: { include: { departure: true, arrival: true } } } },
          items: true,
          payment: true
        }
      }).then(async (booking) => {
        if (discount.promotionId) {
          await tx.promotion.update({
            where: { id: discount.promotionId },
            data: { usageCount: { increment: 1 } }
          });
        }

        return booking;
      });
    });
  }

  async findByCode(code: string) {
    return this.prisma.booking.findUniqueOrThrow({
      where: { bookingCode: code.toUpperCase() },
      include: {
        flight: { include: { airline: true, route: { include: { departure: true, arrival: true } } } },
        items: true,
        payment: true,
        tickets: true
      }
    });
  }

  async listRecent() {
    return this.prisma.booking.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        flight: { include: { airline: true, route: { include: { departure: true, arrival: true } } } },
        payment: true
      }
    });
  }

  async listByCustomerEmail(email: string) {
    return this.prisma.booking.findMany({
      where: { contactEmail: email },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        flight: { include: { airline: true, route: { include: { departure: true, arrival: true } } } },
        items: true,
        payment: true,
        tickets: true
      }
    });
  }

  private async calculatePromotionDiscount(code: string | undefined, orderAmount: number) {
    if (!code) return { amount: 0, promotionId: null as string | null };

    const now = new Date();
    const promotion = await this.prisma.promotion.findUnique({ where: { code: code.trim().toUpperCase() } });
    if (!promotion || !promotion.isActive || promotion.startDate > now || promotion.endDate < now) {
      throw new BadRequestException('Ma khuyen mai khong hop le hoac da het han.');
    }
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      throw new BadRequestException('Ma khuyen mai da het luot su dung.');
    }
    if (promotion.minOrderVND && orderAmount < toNumber(promotion.minOrderVND)) {
      throw new BadRequestException('Don hang chua dat gia tri toi thieu cua ma khuyen mai.');
    }

    const rawDiscount = promotion.discountType === DiscountType.PERCENTAGE
      ? Math.round(orderAmount * (Number(promotion.discountValue) / 100))
      : Number(promotion.discountValue);
    const cappedDiscount = promotion.maxDiscountVND ? Math.min(rawDiscount, toNumber(promotion.maxDiscountVND)) : rawDiscount;

    return {
      amount: Math.max(0, Math.min(cappedDiscount, orderAmount)),
      promotionId: promotion.id
    };
  }
}
