import { ClassType, Gender, PassengerType } from '@prisma/client';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsEmail, IsEnum, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

export class BookingPassengerDto {
  @IsEnum(PassengerType)
  passengerType: PassengerType = PassengerType.ADULT;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  idNumber?: string;
}

export class CreateBookingDto {
  @IsString()
  flightId!: string;

  @IsEnum(ClassType)
  classType: ClassType = ClassType.ECONOMY;

  @ValidateNested({ each: true })
  @Type(() => BookingPassengerDto)
  @ArrayMinSize(1)
  passengers!: BookingPassengerDto[];

  @IsString()
  contactName!: string;

  @IsEmail()
  contactEmail!: string;

  @IsString()
  @MinLength(9)
  contactPhone!: string;

  @IsOptional()
  @IsString()
  promotionCode?: string;
}
