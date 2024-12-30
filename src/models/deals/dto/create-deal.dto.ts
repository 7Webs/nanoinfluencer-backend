import {
  IsArray,
  IsDate,
  IsDecimal,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DealType } from '../entities/deal.entity';

export class CreateDealDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortTagLine: string;

  @ApiProperty()
  @IsString()
  keywords: string;

  @ApiProperty()
  @IsEnum(DealType)
  type: DealType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  availableUntil: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  features: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  images: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  categoryId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  maxPurchaseLimit: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  maxPurchasePerUser: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  percentOff: number; // Discount percentage

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  uptoAmount: number; // Maximum discount amount

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  minSpend: number; // Minimum spend required for the deal

  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal()
  maxSpend: number; // Maximum spend allowed for the deal

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  video: any;

  @ApiProperty({ type: 'string', format: 'binary' })
  imageFiles: any;
}
