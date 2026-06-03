import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  initiate(@Body() body: InitiatePaymentDto) {
    return this.paymentsService.initiate(body.bookingId, body.method);
  }

  @Get(':bookingId')
  status(@Param('bookingId') bookingId: string) {
    return this.paymentsService.status(bookingId);
  }

  @Post(':bookingId/confirm')
  confirm(@Param('bookingId') bookingId: string) {
    return this.paymentsService.confirm(bookingId);
  }
}
