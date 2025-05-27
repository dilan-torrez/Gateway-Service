import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiExcludeController } from '@nestjs/swagger';
import { PaginationDto, NatsService } from 'src/common';

@ApiTags('Module')
@ApiExcludeController() // Todo este controlador no aparecerá en Swagger
@Controller()
export class ModulesController {
  constructor(private readonly nats: NatsService) {}

  @Get('modules')
  @ApiResponse({ status: 200, description: 'Obtener todos los modulos' })
  findAllModules(@Query() paginationDto: PaginationDto) {
    return this.nats.send('modules.findAll', paginationDto);
  }

  @Get('modules/:id')
  @ApiResponse({ status: 200, description: 'Obtener un modulo' })
  async findOneModules(@Param('id') id: string) {
    return this.nats.send('modules.findOne', { id });
  }

  @Get('procedure-types')
  @ApiResponse({ status: 200, description: 'Obtener todos los tipos de modulos' })
  findAllProcedureTypes(@Query() paginationDto: PaginationDto) {
    return this.nats.send('procedureTypes.findAll', paginationDto);
  }

  @Get('procedure-types/:id')
  @ApiResponse({ status: 200, description: 'Obtener un tipo de modulo' })
  async findOneProcedureTypes(@Param('id') id: string) {
    return this.nats.send('procedureTypes.findOne', { id });
  }

  @Get('procedure-modalities')
  @ApiResponse({ status: 200, description: 'Obtener todas las modalidades' })
  findAllProcedureModalities(@Query() paginationDto: PaginationDto) {
    return this.nats.send('procedureModalities.findAll', paginationDto);
  }

  @Get('procedure-modalities/:id')
  @ApiResponse({ status: 200, description: 'Obtener una modalidad' })
  async findOneProcedureModalities(@Param('id') id: string) {
    return this.nats.send('procedureModalities.findOne', { id });
  }
}
