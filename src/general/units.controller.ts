import { Controller, Get, Param, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';

@ApiTags('Unit')
@Controller()
export class UnitsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}
  
  @Get('units')
  @ApiResponse({ status: 200, description: 'Obtener todas las unidades' })
  findAllUnits(@Query() paginationDto: PaginationDto) {
    return this.client.send(
      'units.findAll',
      paginationDto,
    );
  }
  
  @Get('units/:id')
  @ApiResponse({ status: 200, description: 'Obtener una unidad' })
  async findOneUnits(@Param('id') id: string) {
    return this.client.send(
      'units.findOne',
      { id },
    );
  }

  @Get('breakdowns')
  @ApiResponse({ status: 200, description: 'Obtener todos los estados' })
  findAllBreakdowns(@Query() paginationDto: PaginationDto) {
    return this.client.send(
      'breakdowns.findAll',
      paginationDto,
    );
  }
  
  @Get('breakdowns/:id')
  @ApiResponse({ status: 200, description: 'Obtener un estado' })
  async findOneBreakdowns(@Param('id') id: string) {
    return this.client.send(
      'breakdowns.findOne',
      { id },
    );
  }
}
