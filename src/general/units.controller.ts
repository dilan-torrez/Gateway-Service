import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { PaginationDto, NatsService } from 'src/common';

@ApiTags('Unit')
@Controller()
export class UnitsController {
  constructor(private readonly nats: NatsService) {}

  @Get('units')
  @ApiResponse({ status: 200, description: 'Obtener todas las unidades' })
  findAllUnits(@Query() paginationDto: PaginationDto) {
    return this.nats.send('units.findAll', paginationDto);
  }

  @Get('units/:id')
  @ApiResponse({ status: 200, description: 'Obtener una unidad' })
  async findOneUnits(@Param('id') id: string) {
    return this.nats.send('units.findOne', { id });
  }

  @Get('breakdowns')
  @ApiResponse({ status: 200, description: 'Obtener todos los estados' })
  findAllBreakdowns(@Query() paginationDto: PaginationDto) {
    return this.nats.send('breakdowns.findAll', paginationDto);
  }

  @Get('breakdowns/:id')
  @ApiResponse({ status: 200, description: 'Obtener un estado' })
  async findOneBreakdowns(@Param('id') id: string) {
    return this.nats.send('breakdowns.findOne', { id });
  }
}
