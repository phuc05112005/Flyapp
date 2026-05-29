import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async initiate(bookingId: string, method: PaymentMethod) {
    const booking = await this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
    if (booking.status !== 'PENDING') throw new BadRequestException('Đơn hàng không còn ở trạng thái chờ thanh toán.');

    const payment = await this.prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        method,
        gateway: method.toLowerCase(),
        amountVND: booking.totalAmountVND,
        status: method === 'CASH' || method === 'BANK_TRANSFER' ? 'PENDING' : 'PENDING'
      },
      update: {
        method,
        gateway: method.toLowerCase(),
        amountVND: booking.totalAmountVND
      }
    });

    return {
      payment,
      paymentUrl: method === 'VNPAY' || method === 'MOMO' || method === 'ZALOPAY' ? `/payment/mock-gateway?bookingId=${bookingId}` : null,
      bankTransfer: method === 'BANK_TRANSFER' ? {
        bankName: 'Vietcombank',
        accountNumber: '0123456789',
        accountName: 'CONG TY VIETFLY AGENCY',
        content: booking.bookingCode
      } : null
    };
  }

  status(bookingId: string) {
    return this.prisma.payment.findUnique({ where: { bookingId } });
  }
}
