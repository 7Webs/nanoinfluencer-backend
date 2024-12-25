import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDealsRedeemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  dealId: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  socialMediaLink: string;

  // @ApiPropertyOptional({ type: 'string', format: 'binary' })
  // @IsOptional()
  // image: any;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  additionalInfo: string;

}
