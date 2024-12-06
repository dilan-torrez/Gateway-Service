import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { PaginationDto, NatsService } from 'src/common';

@ApiTags('ProcedureDocuments')
@Controller('procedure-documents')
export class ProcedureDocumentsController {
  constructor(private readonly nats: NatsService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Obtener todos los documentos' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.nats.send('procedureDocuments.findAll', paginationDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Obtener un documento' })
  async findOne(@Param('id') id: string) {
    return this.nats.send('procedureDocuments.findOne', { id });
  }
}
