import { Controller, Get, Post, UploadedFile, UseInterceptors, Body, UseGuards, Param } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  WhatsappService,
  SmsService,
  FtpService,
  CitizenshipDigitalService,
  BcbService,
  SmsDto,
  WhatsappDto,
} from 'src/common';
import { AuthGuard } from 'src/auth/guards';

@ApiTags('common')
@Controller('common')
export class CommonController {
  constructor(
    private readonly ftp: FtpService,
    private readonly sms: SmsService,
    private readonly whatsapp: WhatsappService,
    private readonly citizenshipDigital: CitizenshipDigitalService,
    private readonly bcbService: BcbService,
  ) {}

  @MessagePattern('ftp.listFiles')
  async listFiles(data: { path: string; key?: boolean }) {
    return this.ftp.listFiles(data.path, data.key);
  }

  @MessagePattern('ftp.renameFile')
  async renameFile(data: { oldPath: string; newPath: string }) {
    return this.ftp.renameFile(data.oldPath, data.newPath);
  }

  @MessagePattern('ftp.connectSwitch')
  async connectSwitch(data: { value: string }) {
    return this.ftp.connectSwitch(data.value);
  }

  @Post('uploadChunk')
  @ApiOperation({ summary: 'Subir por chunks' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Chunk del archivo (máx. 5MB)',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        chunk: {
          type: 'string',
          format: 'binary',
          description: 'Chunk del archivo',
        },
        openFtp: { type: 'string' },
        closeFtp: { type: 'string' },
        numberChunk: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('chunk'))
  @UseGuards(AuthGuard)
  async uploadChunk(@UploadedFile() chunk: Express.Multer.File, @Body() body: any) {
    const { nameChunk } = body;
    await this.ftp.uploadChunk(chunk, nameChunk);

    return {
      message: 'Chunk subido exitosamente',
      serviceStatus: true,
    };
  }

  @MessagePattern('ftp.saveDataTmp')
  async saveDataTmp(data: { path: string; name: string; data: any }) {
    return await this.ftp.saveDataTmp(data.path, data.name, data.data);
  }

  @MessagePattern('ftp.getDataTmp')
  async getDataTmp(data: { path: string; name: string }) {
    return await this.ftp.getDataTmp(data.path, data.name);
  }

  @MessagePattern('ftp.removeFile')
  async removeFile(data: string[]) {
    return await this.ftp.removeFile(data);
  }

  @MessagePattern('sms.send')
  async sendSms(data: SmsDto) {
    return await this.sms.send(data);
  }

  @MessagePattern('whatsapp.send')
  async whatsappSms(data: WhatsappDto) {
    return await this.whatsapp.send(data);
  }

  @MessagePattern('citizenshipDigital.credentials')
  async citizenshipDigitalCredentials() {
    return await this.citizenshipDigital.citizenshipDigitalCredentials();
  }

  @MessagePattern('citizenshipDigital.findPerson')
  async findPerson(data: any) {
    return await this.citizenshipDigital.findPerson(data);
  }

  @Post('bcb.generateQr')
  @ApiOperation({ summary: 'Generar QR' })
  @ApiBody({
    description: 'Datos para generación de QR / operación BCB',
    required: true,
    schema: {
      type: 'object',
      properties: {
        titularDestinatario: {
          type: 'string',
          example: 'titularDestinatario',
        },
        ciNitDestinatario: {
          type: 'string',
          example: '1111111111',
        },
        eif: {
          type: 'string',
          example: 'MLD10000',
        },
        cuentaDestino: {
          type: 'string',
          example: '130008101400001',
        },
        cuentaDestinoDistribucion: {
          type: 'object',
          additionalProperties: {
            type: 'number',
            format: 'float',
          },
          example: {
            '130008101400001': 20.0,
          },
        },
        codMoneda: {
          type: 'string',
          example: 'BOB',
        },
        importe: {
          type: 'number',
          format: 'float',
          example: 20.0,
        },
        glosa: {
          type: 'string',
          example: 'pruebas',
        },
        fechaVencimiento: {
          type: 'string',
          example: '2025-05-04 01:50:00',
        },
        unicoUso: {
          type: 'boolean',
          example: true,
        },
        codigoServicio: {
          type: 'string',
          example: '0',
        },
        metaData: {
          type: 'object',
          example: {
            dato_de_prueba: 'dato de prueba',
            usuario: 'usuario',
          },
        },
      },
      required: [
        'titularDestinatario',
        'ciNitDestinatario',
        'eif',
        'cuentaDestino',
        'importe',
        'codMoneda',
      ],
    },
  })
  async generateQr(@Body() data: any) {
    return await this.bcbService.send('POST', 'v1/qr', data);
  }

  @Get('bcb.qrStatus/:qrId')
  async qrStatus(@Param('qrId') qrId: string) {
    return await this.bcbService.send('GET', `v1/qr/${qrId}`);
  }

  @ApiBody({
    description: 'Datos de respuesta del QR procesado',
    required: true,
    schema: {
      type: 'object',
      properties: {
        idQR: {
          type: 'string',
          example: '10000121715970417000',
        },
        idOrdenDestinatario: {
          type: 'string',
          example: '145266734545645630',
        },
        eif: {
          type: 'string',
          example: 'MLD10000',
        },
        codMoneda: {
          type: 'string',
          example: 'BOB',
        },
        importe: {
          type: 'number',
          example: 20000,
        },
        cuentaOrigen: {
          type: 'string',
          example: '233333444',
        },
        eifOrigen: {
          type: 'string',
          example: 'MLD1014',
        },
        estado: {
          type: 'string',
          example: 'PROCESADO',
        },
        metaData: {
          type: 'object',
          example: {
            key: 'value',
            otherKey: 123,
          },
          additionalProperties: true,
        },
      },
    },
  })
  @Post('bcb.notifications')
  async notifications(){
    return await this.bcbService.notifications();
  }

  @Get('bcb.entities')
  async entities(){
    return await this.bcbService.notifications();
  }
}
