import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { PaginationDto, NatsService } from 'src/common';

@ApiTags('PensionEntity')
@Controller('pensionEntities')
export class PensionEntitiesController {
  constructor(private readonly nats: NatsService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Obtener todos las entidades de pension' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.nats.send('pensionEntities.findAll', paginationDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Obtener una entidad de pension' })
  async findOne(@Param('id') id: string) {
    return this.nats.send('pensionEntities.findOne', { id });
  }
}
