import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
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

  @Get(':id/documents')
  @ApiResponse({ status: 200, description: 'Mostrar Documentos del Afiliado' })
  async showDocuments(@Param('id') id: string) {
    return this.client.send('affiliateDocuments.showDocuments', { id });
  }
}

