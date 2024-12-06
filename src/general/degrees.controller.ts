import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { NatsService, PaginationDto } from 'src/common';

@ApiTags('Degree')
@Controller()
export class DegreesController {
  constructor(private readonly nats: NatsService) {}

  @Get('degrees')
  @ApiResponse({ status: 200, description: 'Obtener todos los grados' })
  findAllDegrees(@Query() paginationDto: PaginationDto) {
    return this.nats.send('degrees.findAll', paginationDto);
  }

  @Get('degrees/:id')
  @ApiResponse({ status: 200, description: 'Obtener un grado' })
  async findOneDegrees(@Param('id') id: string) {
    return this.nats.send('degrees.findOne', { id });
  }

  @Get('hierarchies')
  @ApiResponse({ status: 200, description: 'Obtener todas las jerarquías' })
  findAllHierarchies(@Query() paginationDto: PaginationDto) {
    return this.nats.send('hierarchies.findAll', paginationDto);
  }

  @Get('hierarchies/:id')
  @ApiResponse({ status: 200, description: 'Obtener una jerarquía' })
  async findOneHierarchies(@Param('id') id: string) {
    return this.nats.send('hierarchies.findOne', { id });
  }
}
