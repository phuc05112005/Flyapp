import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() body: CreateBookingDto) {
    return this.bookingsService.create(body);
  }

  @Get('track/:code')
  track(@Param('code') code: string) {
    return this.bookingsService.findByCode(code);
  }

  @Get()
  recent(@Query('email') email?: string) {
    if (email) return this.bookingsService.listByCustomerEmail(email);
    return this.bookingsService.listRecent();
  }
}
