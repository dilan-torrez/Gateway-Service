import { Controller, Get, Param, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';

@ApiTags('ProcedureDocuments')
@Controller('procedure-documents')
export class ProcedureDocumentsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Obtener todos los documentos' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.client.send(
      'procedureDocuments.findAll',
      paginationDto,
    );
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Obtener un documento' })
  async findOne(@Param('id') id: string) {
    return this.client.send(
      'procedureDocuments.findOne',
      { id },
    );
  }
}
