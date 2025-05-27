import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiExcludeController } from '@nestjs/swagger';
import { PaginationDto, NatsService } from 'src/common';

@ApiTags('FinancialEntity')
@ApiExcludeController() // Todo este controlador no aparecerá en Swagger
@Controller('financialEntities')
export class FinancialEntitiesController {
  constructor(private readonly nats: NatsService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Obtener todos las entidades financieras' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.nats.send('financialEntities.findAll', paginationDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Obtener una entidad financiera' })
  async findOne(@Param('id') id: string) {
    return this.nats.send('financialEntities.findOne', { id });
  }
}
