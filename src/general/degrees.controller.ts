import { Controller, Get, Param, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';

@ApiTags('Degree')
@Controller()
export class DegreesController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Get('degrees')
  @ApiResponse({ status: 200, description: 'Obtener todos los grados' })
  findAllDegrees(@Query() paginationDto: PaginationDto) {
    return this.client.send('degrees.findAll', paginationDto);
  }

  @Get('degrees/:id')
  @ApiResponse({ status: 200, description: 'Obtener un grado' })
  async findOneDegrees(@Param('id') id: string) {
    return this.client.send('degrees.findOne', { id });
  }

  @Get('hierarchies')
  @ApiResponse({ status: 200, description: 'Obtener todas las jerarquías' })
  findAllHierarchies(@Query() paginationDto: PaginationDto) {
    return this.client.send('hierarchies.findAll', paginationDto);
  }

  @Get('hierarchies/:id')
  @ApiResponse({ status: 200, description: 'Obtener una jerarquía' })
  async findOneHierarchies(@Param('id') id: string) {
    return this.client.send('hierarchies.findOne', { id });
  }
}
