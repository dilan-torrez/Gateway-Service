import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NATS_SERVICE } from 'src/config';
import { FileRequiredPipe } from './pipes/file-required.pipe';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { RecordService } from 'src/records/record.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
@ApiTags('affiliates')
@Controller('affiliates')
export class AffiliatesController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly recordService: RecordService,
  ) {}

  @Get(':affiliateId')
  @ApiResponse({ status: 200, description: 'Mostrar datos del afiliado' })
  async findOneData(@Param('affiliateId') affiliateId: string) {
    return this.client.send('affiliate.findOneData', { affiliateId });
  }

  @Post(':affiliateId/:procedureDocumentId/create-or-update-document')
  @ApiOperation({ summary: 'Enlazar y Subir Documento del Afiliado' })
  @ApiResponse({ status: 200, description: 'El documento fue subido exitosamente.' })
  @ApiResponse({
    status: 400,
    description: 'El archivo PDF es obligatorio o el archivo no es válido.',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  @ApiParam({ name: 'affiliateId', description: 'ID del afiliado', type: Number, example: 123 })
  @ApiParam({
    name: 'procedureDocumentId',
    description: 'ID del del documento',
    type: Number,
    example: 456,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo PDF del documento del afiliado',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        documentPdf: {
          type: 'string',
          format: 'binary',
          description: 'Archivo PDF a subir',
        },
      },
    },
  })
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('documentPdf'))
  @UsePipes(new FileRequiredPipe())
  async createOrUpdateDocument(
    @Req() req: any,
    @Param('affiliateId') affiliateId: string,
    @Param('procedureDocumentId') procedureDocumentId: string,
    @UploadedFile() documentPdf: Express.Multer.File,
  ) {
    this.recordService.http(
      `Registro de documento [${procedureDocumentId}]`,
      req.user,
      2,
      +affiliateId,
      'Affiliate',
    );
    return this.client.send('affiliate.createOrUpdateDocument', {
      affiliateId,
      procedureDocumentId,
      documentPdf,
    });
  }

  @Get(':affiliateId/documents')
  @ApiResponse({ status: 200, description: 'Mostrar Documentos del Afiliado' })
  async showDocuments(@Param('affiliateId') affiliateId: string) {
    return this.client.send('affiliate.showDocuments', { affiliateId });
  }

  @Get(':affiliateId/documents/:procedureDocumentId')
  @ApiResponse({ status: 200, description: 'Buscar el documento del Afiliado' })
  async findDocument(
    @Param('affiliateId') affiliateId: string,
    @Param('procedureDocumentId') procedureDocumentId: string,
    @Res() res: Response,
  ) {
    const documentPdf = await firstValueFrom(
      this.client.send('affiliate.findDocument', { affiliateId, procedureDocumentId }),
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${affiliateId}${procedureDocumentId}.pdf"`,
    });

    res.send(Buffer.from(documentPdf, 'base64'));
  }

  @Get(':affiliateId/modality/:modalityId')
  @ApiResponse({
    status: 200,
    description: 'Cotejar documentos del Afiliado con los documentos requeridos de la modalidad',
  })
  async collateDocuments(
    @Param('affiliateId') affiliateId: string,
    @Param('modalityId') modalityId: string,
  ) {
    return this.client.send('affiliate.collateDocuments', { affiliateId, modalityId });
  }
}
