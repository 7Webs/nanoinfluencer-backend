import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProvideSubscriptionDto {
  @ApiProperty({
    description: 'Plan Id',
    example: 14,
  })
  @IsNumber()
  @Min(0)
  planId?: number;

  @ApiProperty({
    description: 'Shop Id',
    example: 14,
  })
  @IsNumber()
  @Min(0)
  shopId?: number;

  @ApiProperty({
    description: 'no. of months to be subscribed',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  months: number;
}
