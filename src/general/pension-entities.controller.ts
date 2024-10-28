import { Controller, Get, Param, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';

@ApiTags('PensionEntity')
@Controller('pensionEntities')
export class PensionEntitiesController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Obtener todos las entidades de pension' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.client.send('pensionEntities.findAll', paginationDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Obtener una entidad de pension' })
  async findOne(@Param('id') id: string) {
    return this.client.send('pensionEntities.findOne', { id });
  }
}
