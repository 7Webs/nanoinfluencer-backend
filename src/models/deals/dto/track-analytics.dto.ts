import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { DealAnalyticsType } from '../entities/deal-analytics.entity';

export class TrackAnalyticsDto {
  @ApiProperty()
  @IsEnum(DealAnalyticsType)
  type: DealAnalyticsType;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}
