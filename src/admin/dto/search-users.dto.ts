import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Pagination } from 'src/common/dtos/pagination.dto';
import { Gender, UserRole } from 'src/models/user/entities/user.entity';

export class UsersSearchDto extends Pagination {
  @ApiPropertyOptional({
    description: 'Search by email, name, or phone',
    example: '',
    default: '',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: '',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort direction',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortDirection?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'Filter by gender',
    enum: Gender,
    example: Gender.male,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Filter by role',
    enum: UserRole,
    example: UserRole.user,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Filter by approval status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true || value === 1)
  approved?: boolean;

  @ApiPropertyOptional({ description: 'Filter by category ID', example: 1 })
  @IsOptional()
  @IsNumber()
  categoryId?: number;
}
