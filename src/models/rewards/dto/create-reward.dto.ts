import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { RewardType } from '../entities/reward.entity';
import { Transform } from 'class-transformer';

export class CreateRewardDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: RewardType, default: RewardType.OTHER })
  @IsEnum(RewardType)
  type: RewardType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  value?: number;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  image: any;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  validityDays?: number;
}