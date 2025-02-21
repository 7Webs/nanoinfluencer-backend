import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { RedeemedDealStatus } from '../entities/deals-redeem.entity';

export class CloseDealsRedeemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(RedeemedDealStatus)
  status: RedeemedDealStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  adminComment: string;
}
