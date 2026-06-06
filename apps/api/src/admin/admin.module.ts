import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { FlightsModule } from '../flights/flights.module';

@Module({
  imports: [FlightsModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService]
})
export class AdminModule {}
