import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Pagination } from 'src/common/dtos/pagination.dto';

export class UserShopSearchDto extends Pagination {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly approved?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  readonly categoryId?: number;
}
