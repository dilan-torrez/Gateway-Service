import { Controller, Get, Inject, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { NATS_SERVICE } from 'src/config';

@ApiTags('affiliates')
@Controller('affiliates')
export class AffiliatesController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}
  
  @Get(':id')
  @ApiResponse({ status: 200, description: 'Mostrar un afiliado' })
  async findOneAffiliates(@Param('id') id: string) {
    return this.client.send('affiliate.findOne', { id });
  }

  @Post(':affiliate_id/:procedure_document_id/create-document')
  @ApiResponse({ status: 200, description: 'Enlazar y Subir Documento del Afiliado' })
  @UseInterceptors(FileInterceptor('file_document_pdf'))
  async createDocuments(
    @Param('affiliate_id') affiliateId: string,
    @Param('procedure_document_id') procedureDocumentId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    console.log('Archivo recibido:', file);
    return this.client.send('affiliate.createDocuments', {
      affiliateId,
      procedureDocumentId,
      filename: file.originalname,
      buffer: file.buffer
    });
  }

  @Get(':id/documents')
  @ApiResponse({ status: 200, description: 'Mostrar Documentos del Afiliado' })
  async showDocuments(@Param('id') id: string) {
    return this.client.send('affiliate.showDocuments', { id });
  }
}

