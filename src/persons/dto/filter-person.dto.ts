import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FilterDto extends PartialType(PaginationDto) {
  @IsString()
  @IsOptional()
  filter: string;
}
