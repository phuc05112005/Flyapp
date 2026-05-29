import { Module } from '@nestjs/common';
import { MockAirlineProvider } from '../common/providers/mock-airline.provider';
import { PrismaService } from '../prisma.service';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, PrismaService, MockAirlineProvider],
  exports: [BookingsService]
})
export class BookingsModule {}
