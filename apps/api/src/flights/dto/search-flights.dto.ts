import { ApiPropertyOptional } from '@nestjs/swagger';
import { ClassType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchFlightsDto {
  @IsString()
  from!: string;

  @IsString()
  to!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9)
  adults = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(8)
  children = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(4)
  infants = 0;

  @ApiPropertyOptional({ enum: ClassType })
  @IsOptional()
  @IsEnum(ClassType)
  classType: ClassType = ClassType.ECONOMY;

  @IsOptional()
  @IsString()
  airline?: string;

  @IsOptional()
  @IsString()
  sortBy?: 'price' | 'duration' | 'departure';
}
