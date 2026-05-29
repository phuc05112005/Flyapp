import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { toNumber } from '../common/utils/money';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [bookingsToday, pendingBookings, customers, paidBookings] = await Promise.all([
      this.prisma.booking.count({ where: { createdAt: { gte: today } } }),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.booking.findMany({ where: { status: { in: ['PAID', 'CONFIRMED'] }, createdAt: { gte: today } } })
    ]);

    return {
      bookingsToday,
      pendingBookings,
      customers,
      revenueTodayVND: paidBookings.reduce((sum, booking) => sum + toNumber(booking.totalAmountVND), 0)
    };
  }

  recentBookings() {
    return this.prisma.booking.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        flight: { include: { airline: true, route: { include: { departure: true, arrival: true } } } }
      }
    });
  }
}
