import { Controller, Get, Param, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';

@ApiTags('FinancialEntity')
@Controller('financialEntities')
export class FinancialEntitiesController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}
  
  @Get()
  @ApiResponse({ status: 200, description: 'Obtener todos las entidades financieras' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.client.send(
      'financialEntities.findAll',
      paginationDto,
    );
  }
  
  @Get(':id')
  @ApiResponse({ status: 200, description: 'Obtener una entidad financiera' })
  async findOne(@Param('id') id: string) {
    return this.client.send(
      'financialEntities.findOne',
      { id },
    );
  }
}
