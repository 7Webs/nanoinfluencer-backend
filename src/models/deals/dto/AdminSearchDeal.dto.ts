import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Pagination } from 'src/common/dtos/pagination.dto';
import { DealSearchDto } from './deal.search.dto';

export class AdminDealSearchDto extends DealSearchDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  expired?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  deleted?: string;
}
