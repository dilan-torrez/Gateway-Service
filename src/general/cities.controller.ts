import { Controller, Get, Param, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';

@ApiTags('City')
@Controller('cities')
export class CitiesController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}
  
  @Get()
  @ApiResponse({ status: 200, description: 'Obtener todos las ciudades' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.client.send(
      'cities.findAll',
      paginationDto,
    );
  }
  
  @Get(':id')
  @ApiResponse({ status: 200, description: 'Obtener una ciudad' })
  async findOne(@Param('id') id: string) {
    return this.client.send(
      'cities.findOne',
      { id },
    );
  }
}
