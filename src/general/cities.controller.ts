import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { PaginationDto, NatsService } from 'src/common';

@ApiTags('City')
@Controller('cities')
export class CitiesController {
  constructor(private readonly nats: NatsService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Obtener todos las ciudades' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.nats.send('cities.findAll', paginationDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Obtener una ciudad' })
  async findOne(@Param('id') id: string) {
    return this.nats.send('cities.findOne', { id });
  }
}
