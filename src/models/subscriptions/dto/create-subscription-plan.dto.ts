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
import { SubscriptionInterval } from '../entities/subscription-plan.entity';

export class CreateSubscriptionPlanDto {
  @ApiProperty({
    description: 'The name of the subscription plan (e.g., "Basic Plan").',
    example: 'Basic Plan',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Price of the subscription plan.',
    example: 9.99,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description:
      'Billing interval of the subscription plan (e.g., "month", "year").',
    enum: SubscriptionInterval,
    example: SubscriptionInterval.MONTH,
  })
  @IsNotEmpty()
  @IsEnum(SubscriptionInterval)
  interval: SubscriptionInterval;

  @ApiPropertyOptional({
    description: 'Description of the subscription plan.',
    example: 'This is a basic plan suitable for individuals.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Indicates whether the subscription plan is active.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Number of trial days for the subscription plan.',
    example: 14,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  trialDays?: number;
}
