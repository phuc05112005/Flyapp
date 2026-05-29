import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { FlightsModule } from './flights/flights.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    FlightsModule,
    BookingsModule,
    PaymentsModule,
    AdminModule
  ],
  providers: [PrismaService],
  exports: [PrismaService]
})
export class AppModule {}
