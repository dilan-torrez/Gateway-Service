import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FilteredPaginationDto extends PartialType(PaginationDto) {
  @IsString()
  @IsOptional()
  filter: string;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC' = 'ASC';
}
