import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class InitiatePaymentDto {
  @IsString()
  bookingId!: string;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;
}
