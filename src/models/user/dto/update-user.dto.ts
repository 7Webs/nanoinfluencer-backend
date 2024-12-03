import { PartialType } from '@nestjs/mapped-types';
import { SignUpUserDto } from './signup-user.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Gender, UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsOptional()
  birthDate: Date;

  @ApiPropertyOptional()
  @IsEnum(Gender)
  @IsOptional()
  gender: Gender;

  @ApiPropertyOptional()
  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  categoryId: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  facebookProfileLink?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  instagramProfileLink?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tiktokProfileLink?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  twitterProfileLink?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  youtubeProfileLink?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  linkedinProfileLink?: string;
}

