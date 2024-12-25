import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Pagination } from 'src/common/dtos/pagination.dto';
import { SubscriptionState } from 'src/models/shop/entities/shop.entity';

export class ShopSearchDto extends Pagination {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string; // For searching name, email, or description

  @IsOptional()
  @ApiPropertyOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true || value === 1)
  approved?: boolean; // Filter by approval status

  @IsOptional()
  @ApiPropertyOptional()
  @IsNumber()
  categoryId?: number; // Filter by category ID

  @IsOptional()
  @ApiPropertyOptional()
  @IsEnum(SubscriptionState)
  subscriptionState?: SubscriptionState; // Filter by subscription state
}
