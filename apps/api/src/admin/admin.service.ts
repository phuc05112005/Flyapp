import { BadRequestException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { toNumber } from '../common/utils/money';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private paymentSettingDefaults = {
    bankName: 'Vietcombank',
    accountNumber: '0123456789',
    accountName: 'CONG TY VIETFLY AGENCY',
    branch: 'TP. Ho Chi Minh',
    note: 'Vui lòng chuyển khoản đúng nội dung mã đặt vé để đại lý đối soát nhanh.'
  };

  async stats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [bookingsToday, pendingBookings, customers, paidBookings, confirmedBookings, totalBookings] = await Promise.all([
      this.prisma.booking.count({ where: { createdAt: { gte: today } } }),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.booking.findMany({ where: { status: { in: ['PAID', 'CONFIRMED'] }, createdAt: { gte: today } } }),
      this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.booking.count()
    ]);

    return {
      bookingsToday,
      pendingBookings,
      customers,
      confirmedBookings,
      totalBookings,
      revenueTodayVND: paidBookings.reduce((sum, booking) => sum + toNumber(booking.totalAmountVND), 0)
    };
  }

  recentBookings() {
    return this.prisma.booking.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, fullName: true, role: true } },
        flight: { include: { airline: true, route: { include: { departure: true, arrival: true } } } },
        items: true,
        payment: true,
        tickets: true
      }
    });
  }

  async paymentSettings() {
    const existing = await this.prisma.agencyPaymentSetting.findFirst({
      orderBy: { createdAt: 'asc' }
    });
    if (existing) return existing;

    return this.prisma.agencyPaymentSetting.create({
      data: this.paymentSettingDefaults
    });
  }

  async updatePaymentSettings(data: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    branch?: string;
    qrImageDataUrl?: string;
    note?: string;
  }) {
    const current = await this.paymentSettings();
    return this.prisma.agencyPaymentSetting.update({
      where: { id: current.id },
      data: {
        bankName: data.bankName.trim(),
        accountNumber: data.accountNumber.trim(),
        accountName: data.accountName.trim(),
        branch: data.branch?.trim() || null,
        qrImageDataUrl: data.qrImageDataUrl || null,
        note: data.note?.trim() || null
      }
    });
  }

  async listStaff() {
    return this.prisma.user.findMany({
      where: { role: Role.STAFF },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createStaff(data: any) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) throw new BadRequestException('Email đã được sử dụng.');

    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: await bcrypt.hash(data.password, 12),
        fullName: data.fullName,
        phone: data.phone,
        role: Role.STAFF,
        isVerified: true
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true
      }
    });
  }
}
