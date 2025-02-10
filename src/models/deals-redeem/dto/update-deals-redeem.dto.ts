import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateDealsRedeemDto } from './create-deals-redeem.dto';
import { IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateDealsRedeemDto extends PartialType(CreateDealsRedeemDto) {
  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  totalViews: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  totalLikes: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  totalComments: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  amountSpent: number;
}
