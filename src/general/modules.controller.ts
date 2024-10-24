import { Controller, Get, Param, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';

@ApiTags('Module')
@Controller()
export class ModulesController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Get('modules')
  @ApiResponse({ status: 200, description: 'Obtener todos los modulos' })
  findAllModules(@Query() paginationDto: PaginationDto) {
    return this.client.send(
      'modules.findAll',
      paginationDto,
    );
  }

  @Get('modules/:id')
  @ApiResponse({ status: 200, description: 'Obtener un modulo' })
  async findOneModules(@Param('id') id: string) {
    return this.client.send(
      'modules.findOne',
      { id },
    );
  }

  @Get('procedure-types')
  @ApiResponse({ status: 200, description: 'Obtener todos los tipos de modulos' })
  findAllProcedureTypes(@Query() paginationDto: PaginationDto) {
    return this.client.send(
      'procedureTypes.findAll',
      paginationDto,
    );
  }

  @Get('procedure-types/:id')
  @ApiResponse({ status: 200, description: 'Obtener un tipo de modulo' })
  async findOneProcedureTypes(@Param('id') id: string) {
    return this.client.send(
      'procedureTypes.findOne',
      { id },
    );
  }

  @Get('procedure-modalities')
  @ApiResponse({ status: 200, description: 'Obtener todas las modalidades' })
  findAllProcedureModalities(@Query() paginationDto: PaginationDto) {
    return this.client.send(
      'procedureModalities.findAll',
      paginationDto,
    );
  }

  @Get('procedure-modalities/:id')
  @ApiResponse({ status: 200, description: 'Obtener una modalidad' })
  async findOneProcedureModalities(@Param('id') id: string) {
    return this.client.send(
      'procedureModalities.findOne',
      { id },
    );
  }

}
