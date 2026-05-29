import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';

@Module({
  controllers: [FlightsController],
  providers: [FlightsService, PrismaService],
  exports: [FlightsService]
})
export class FlightsModule {}
