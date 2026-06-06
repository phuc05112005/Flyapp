import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { AdminService } from './admin.service';

class AgencyPaymentSettingDto {
  @IsString()
  bankName!: string;

  @IsString()
  accountNumber!: string;

  @IsString()
  accountName!: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsString()
  qrImageDataUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}

class CreateStaffDto {
  @IsString()
  email!: string;

  @IsString()
  @MaxLength(32)
  password!: string;

  @IsString()
  fullName!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  stats() {
    return this.adminService.stats();
  }

  @Get('bookings')
  bookings() {
    return this.adminService.recentBookings();
  }

  @Get('flights')
  flights() {
    return this.adminService.listFlights();
  }

  @Get('payment-settings')
  paymentSettings() {
    return this.adminService.paymentSettings();
  }

  @Put('payment-settings')
  updatePaymentSettings(@Body() body: AgencyPaymentSettingDto) {
    return this.adminService.updatePaymentSettings(body);
  }

  @Get('staff')
  listStaff() {
    return this.adminService.listStaff();
  }

  @Get('airlines/:airlineId/services')
  airlineServices(@Param('airlineId') airlineId: string) {
    return this.adminService.airlineServices(airlineId);
  }

  @Get('airlines/:airlineId/baggage')
  airlineBaggage(@Param('airlineId') airlineId: string) {
    return this.adminService.airlineBaggage(airlineId);
  }

  @Put('staff')
  createStaff(@Body() body: CreateStaffDto) {
    return this.adminService.createStaff(body);
  }
}
