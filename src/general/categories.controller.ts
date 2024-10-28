import { Controller, Get, Param, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';

@ApiTags('Category')
@Controller('categories')
export class CategoriesController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Obtener todos las categorías' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.client.send('categories.findAll', paginationDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Obtener una categoría' })
  async findOne(@Param('id') id: string) {
    return this.client.send('categories.findOne', { id });
  }
}
