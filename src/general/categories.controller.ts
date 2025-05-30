import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiExcludeController } from '@nestjs/swagger';
import { PaginationDto, NatsService } from 'src/common';

@ApiTags('Category')
@ApiExcludeController() // Todo este controlador no aparecerá en Swagger
@Controller('categories')
export class CategoriesController {
  constructor(private readonly nats: NatsService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Obtener todos las categorías' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.nats.send('categories.findAll', paginationDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Obtener una categoría' })
  async findOne(@Param('id') id: string) {
    return this.nats.send('categories.findOne', { id });
  }
}
