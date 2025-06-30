import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Res,
  Req,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  FileRequiredPipe,
  FileChunkRequiredPipe,
  NatsService,
  RecordService,
  //PdfService,
} from 'src/common';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
@ApiTags('affiliates')
@Controller('affiliates')
export class AffiliatesController {
  constructor(
    private readonly nats: NatsService,
    private readonly recordService: RecordService,
    //private readonly pdfService: PdfService,
  ) {}

  @Get('fileDossiers')
  @ApiResponse({ status: 200, description: 'Obtener todos los tipos de expedients' })
  findAllFileDossiers() {
    return this.nats.send('affiliate.findAllFileDossiers', []);
  }

  @Get(':affiliateId')
  @ApiResponse({ status: 200, description: 'Mostrar datos del afiliado' })
  async findOneData(@Param('affiliateId') affiliateId: string) {
    return this.nats.send('affiliate.findOneData', { affiliateId });
  }

  @Post(':affiliateId/document/:procedureDocumentId/createOrUpdate')
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
  async createOrUpdateDocument(
    @Req() req: any,
    @Param('affiliateId') affiliateId: string,
    @Param('procedureDocumentId') procedureDocumentId: string,
    @UploadedFile(new FileRequiredPipe()) documentPdf: Express.Multer.File,
  ) {
    this.recordService.http(
      `Registro de documento [${procedureDocumentId}]`,
      req.user,
      2,
      +affiliateId,
      'Affiliate',
    );
    // const compressed = await this.pdfService.compressPdf(documentPdf.buffer);
    // const fileObject: Express.Multer.File = {
    //   fieldname: 'documentPdf',
    //   originalname: 'CONT_AFP.PDF',
    //   encoding: '7bit',
    //   mimetype: 'application/pdf',
    //   buffer: compressed,
    //   size: compressed.length,
    //   destination: '',
    //   filename: '',
    //   path: '',
    //   stream: Readable.from(compressed),
    // };
    return this.nats.send('affiliate.createOrUpdateDocument', {
      affiliateId,
      procedureDocumentId,
      documentPdf,
    });
  }

  @Get(':affiliateId/documents')
  @ApiResponse({ status: 200, description: 'Mostrar Documentos del Afiliado' })
  async showDocuments(@Param('affiliateId') affiliateId: string) {
    return this.nats.send('affiliate.showDocuments', { affiliateId });
  }

  @Get(':affiliateId/showFileDossiers')
  @ApiResponse({ status: 200, description: 'Mostrar Expedientes del Afiliado' })
  async showFileDossiers(@Param('affiliateId') affiliateId: string) {
    return this.nats.send('affiliate.showFileDossiers', { affiliateId });
  }

  @Post(':affiliateId/fileDossier/:fileDossierId/concatChunksAndUploadFile/:totalChunks')
  @ApiOperation({
    summary: 'Unir chunks y subir expediente del afiliado al FTP',
    description: `Este endpoint concatena los chunks previamente subidos al servidor temporal
  y genera el archivo final del expediente. Luego, el archivo se sube al FTP en la ruta correspondiente.`,
  })
  @ApiResponse({
    status: 200,
    description: 'El expediente fue concatenado y subido exitosamente al FTP.',
  })
  @ApiResponse({
    status: 400,
    description: 'No se encontraron todos los chunks necesarios para unir el expediente.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor durante la unión o subida del expediente.',
  })
  @ApiParam({
    name: 'affiliateId',
    description: 'ID del afiliado',
    type: Number,
    example: 123,
  })
  @ApiParam({
    name: 'fileDossierId',
    description: 'ID del expediente',
    type: Number,
    example: 456,
  })
  @ApiParam({
    name: 'totalChunks',
    description: 'Cantidad total de chunks que componen el archivo',
    type: Number,
    example: 5,
  })
  @UseGuards(AuthGuard)
  async concatChunksAndUploadFile(
    @Req() req: any,
    @Param('affiliateId') affiliateId: string,
    @Param('fileDossierId') fileDossierId: string,
    @Param('totalChunks') totalChunks: string,
  ) {
    this.recordService.http(
      `Unión de chunks y subida de expediente [${fileDossierId}]`,
      req.user,
      2,
      +affiliateId,
      'Affiliate',
    );
    return this.nats.send('affiliate.concatChunksAndUploadFile', {
      affiliateId,
      fileDossierId,
      totalChunks,
    });
  }

  @Post(':affiliateId/fileDossier/:fileDossierId/uploadChunk/:numberChunk')
  @ApiOperation({ summary: 'Subir chunk de documento del afiliado' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Chunk del archivo PDF (máx. 5MB)',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        chunk: {
          type: 'string',
          format: 'binary',
          description: 'Chunk del archivo PDF',
        },
        chunkIndex: { type: 'string' },
        totalChunks: { type: 'string' },
        fileName: { type: 'string' },
        fileId: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('chunk'))
  async uploadChunk(
    @Param('affiliateId') affiliateId: string,
    @Param('fileDossierId') fileDossierId: string,
    @Param('numberChunk') numberChunk: string,
    @UploadedFile(new FileChunkRequiredPipe()) chunk: Express.Multer.File,
  ) {
    return this.nats.send('affiliate.uploadChunk', {
      affiliateId,
      fileDossierId,
      numberChunk,
      chunk,
    });
  }

  @Get(':affiliateId/fileDossiers/:fileDossierId')
  @ApiResponse({ status: 200, description: 'Buscar el expediente del Afiliado' })
  async findFileDossier(
    @Param('affiliateId') affiliateId: string,
    @Param('fileDossierId') fileDossierId: string,
    @Res() res: Response,
  ) {
    const fileDossierPdf = await this.nats.firstValue('affiliate.findFileDossier', {
      affiliateId,
      fileDossierId,
    });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${affiliateId}${fileDossierId}.pdf"`,
    });
    res.send(Buffer.from(fileDossierPdf, 'base64'));
  }

  @Get(':affiliateId/documents/:procedureDocumentId')
  @ApiResponse({ status: 200, description: 'Buscar el documento del Afiliado' })
  async findDocument(
    @Param('affiliateId') affiliateId: string,
    @Param('procedureDocumentId') procedureDocumentId: string,
    @Res() res: Response,
  ) {
    const documentPdf = await this.nats.firstValue('affiliate.findDocument', {
      affiliateId,
      procedureDocumentId,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${affiliateId}${procedureDocumentId}.pdf"`,
    });

    res.send(Buffer.from(documentPdf, 'base64'));
  }

  @UseGuards(AuthGuard)
  @Get(':affiliateId/modality/:modalityId/collate')
  @ApiResponse({
    status: 200,
    description: 'Cotejar documentos del Afiliado con los documentos requeridos de la modalidad',
  })
  async collateDocuments(
    @Param('affiliateId') affiliateId: string,
    @Param('modalityId') modalityId: string,
  ) {
    return this.nats.send('affiliate.collateDocuments', { affiliateId, modalityId });
  }

  @Post('documents/analysis')
  async documentsAnalysis(@Body() body: { path: string; user: string; pass: string }) {
    const { path, user, pass } = body;

    this.recordService.http(
      `Realizo el análisis de documentos en la ruta ${path}`,
      user,
      1,
      1,
      'User',
    );

    return this.nats.send('affiliate.documentsAnalysis', { path, user, pass });
  }

  @Post('documents/imports')
  async documentsImports(@Body() body: object) {
    return this.nats.send('affiliate.documentsImports', body);
  }
}
