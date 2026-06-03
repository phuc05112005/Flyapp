import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma.service';

function issueCode(prefix: string, length = 8) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return `${prefix}-${Array.from(randomBytes(length), (byte) => alphabet[byte % alphabet.length]).join('')}`;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async initiate(bookingId: string, method: PaymentMethod) {
    const booking = await this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Đơn hàng không còn ở trạng thái chờ thanh toán.');
    }

    const bankSetting = method === 'BANK_TRANSFER' ? await this.getPaymentSetting() : null;
    const payment = await this.prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        method,
        gateway: method.toLowerCase(),
        amountVND: booking.totalAmountVND,
        status: 'PENDING'
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
      bankTransfer: method === 'BANK_TRANSFER' && bankSetting ? {
        bankName: bankSetting.bankName,
        accountNumber: bankSetting.accountNumber,
        accountName: bankSetting.accountName,
        branch: bankSetting.branch,
        qrImageDataUrl: bankSetting.qrImageDataUrl,
        note: bankSetting.note,
        content: booking.bookingCode,
        amountVND: Number(booking.totalAmountVND)
      } : null
    };
  }

  status(bookingId: string) {
    return this.prisma.payment.findUnique({ where: { bookingId } });
  }

  async confirm(bookingId: string) {
    const booking = await this.prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: {
        items: true,
        payment: true
      }
    });

    if (!booking.payment) throw new BadRequestException('Đơn hàng chưa khởi tạo thanh toán.');
    if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
      throw new BadRequestException('Đơn hàng không còn hiệu lực để thanh toán.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { bookingId },
        data: {
          status: 'SUCCESS',
          paidAt: new Date(),
          gatewayTxId: issueCode('TX'),
          rawResponse: { mode: 'mock', approved: true }
        }
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          paidAt: new Date()
        }
      });

      for (const item of booking.items) {
        await tx.ticket.upsert({
          where: { bookingItemId: item.id },
          create: {
            bookingId,
            bookingItemId: item.id,
            ticketNumber: issueCode('VFT', 10),
            pnrCode: booking.providerPnr
          },
          update: {
            pnrCode: booking.providerPnr
          }
        });
      }

      return tx.booking.findUniqueOrThrow({
        where: { id: bookingId },
        include: {
          flight: { include: { airline: true, route: { include: { departure: true, arrival: true } } } },
          items: true,
          payment: true,
          tickets: true
        }
      });
    });
  }

  private async getPaymentSetting() {
    const existing = await this.prisma.agencyPaymentSetting.findFirst({
      orderBy: { createdAt: 'asc' }
    });
    if (existing) return existing;

    return this.prisma.agencyPaymentSetting.create({
      data: {
        bankName: 'Vietcombank',
        accountNumber: '0123456789',
        accountName: 'CONG TY VIETFLY AGENCY',
        branch: 'TP. Ho Chi Minh',
        note: 'Vui lòng chuyển khoản đúng nội dung mã đặt vé để đại lý đối soát nhanh.'
      }
    });
  }
}
