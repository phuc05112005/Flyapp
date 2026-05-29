import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';

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
}
