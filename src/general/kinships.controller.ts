import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiExcludeController } from '@nestjs/swagger';
import { PaginationDto, NatsService } from 'src/common';

@ApiTags('Kinship')
@ApiExcludeController() // Todo este controlador no aparecerá en Swagger
@Controller('kinships')
export class KinshipsController {
  constructor(private readonly nats: NatsService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Obtener todos los parentescos' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.nats.send('kinships.findAll', paginationDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Obtener un parentesco' })
  async findOne(@Param('id') id: string) {
    return this.nats.send('kinships.findOne', { id });
  }
}
