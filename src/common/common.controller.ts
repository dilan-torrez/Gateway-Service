import {
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
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

  @MessagePattern('bcb.generateQr')
  async generateQr(@Payload() data: any) {
    try {
      return await this.bcbService.generateQr(data);
    } catch (error) {
      return this.buildBcbErrorResponse(error);
    }
  }

  @MessagePattern('bcb.qrStatus')
  async qrStatus(@Payload() data: string | { qrId?: string; idQr?: string; idQR?: string }) {
    try {
      const qrId = typeof data === 'string' ? data : (data?.qrId ?? data?.idQr ?? data?.idQR);
      return await this.bcbService.qrStatus(qrId);
    } catch (error) {
      return this.buildBcbErrorResponse(error);
    }
  }

  @MessagePattern('bcb.status')
  async bcbStatusMessage() {
    try {
      return await this.bcbService.status();
    } catch (error) {
      return this.buildBcbErrorResponse(error);
    }
  }

  @MessagePattern('bcb.createAccount')
  async createBcbAccount(@Payload() data: any) {
    try {
      return await this.bcbService.createAccount(data);
    } catch (error) {
      return this.buildBcbErrorResponse(error);
    }
  }

  @MessagePattern('bcb.updateAccount')
  async updateBcbAccount(@Payload() data: any) {
    try {
      const cta = data?.cta ?? data?.cuenta ?? data?.accountNumber;
      const payload = data?.data ?? data;
      return await this.bcbService.updateAccount(cta, payload);
    } catch (error) {
      return this.buildBcbErrorResponse(error);
    }
  }

  @ApiOperation({ summary: 'Recibir notificación BCB' })
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
        ciNitOriginante: {
          type: 'string',
          example: '12345678',
        },
        nombreOriginante: {
          type: 'string',
          example: 'Juan Perez',
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
        tipoNotificacion: {
          type: 'string',
          example: 'T1',
        },
        estado: {
          type: 'string',
          enum: ['PROCESADO', 'RECHAZADO', 'NO PROCESADO'],
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
      required: ['idQR', 'eif', 'codMoneda', 'estado'],
    },
  })
  @Post('bcb.notifications')
  async notifications(@Body() data: any) {
    return await this.bcbService.notifications(data);
  }

  @Get('bcb.entities')
  @ApiOperation({ summary: 'Obtener datos de entidad BCB' })
  async entities() {
    return await this.bcbService.entities();
  }

  @Post('bcb.accounts')
  @ApiOperation({ summary: 'Crear cuenta BCB' })
  @ApiBody({
    description:
      'Datos de la cuenta a registrar en BCB. eifCuenta es la cuenta de la Entidad Financiera; cta es la cuenta transitoria que devuelve BCB.',
    required: true,
    schema: {
      type: 'object',
      required: ['eif', 'eifCuenta', 'ciNitTitular', 'nombreTitular'],
      properties: {
        eif: {
          type: 'string',
          example: 'MLD1014',
        },
        eifCuenta: {
          type: 'string',
          example: '1505651746',
        },
        ciNitTitular: {
          type: 'string',
          example: '234578021',
        },
        nombreTitular: {
          type: 'string',
          example: 'DGPRUEBAS',
        },
        estado: {
          type: 'string',
          example: 'ACTIVO',
        },
      },
      example: {
        eif: 'MLD1014',
        eifCuenta: '1505651746',
        ciNitTitular: '234578021',
        nombreTitular: 'DGPRUEBAS',
        estado: 'ACTIVO',
      },
    },
  })
  async createAccount(@Body() data: any) {
    try {
      return await this.bcbService.createAccount(data);
    } catch (error) {
      return this.buildBcbErrorResponse(error);
    }
  }

  @Put('bcb.accounts/:cta')
  @ApiOperation({ summary: 'Actualizar cuenta BCB' })
  @ApiBody({
    description: 'Datos de la cuenta a actualizar en BCB',
    required: true,
    schema: {
      type: 'object',
      additionalProperties: true,
      example: {
        eif: 'MLD1014',
        eifCuenta: '1505651746',
        ciNitTitular: '1001543025',
        nombreTitular: 'Percy',
        estado: 'ACTIVO',
      },
    },
  })
  async updateAccount(@Param('cta') cta: string, @Body() data: any) {
    try {
      return await this.bcbService.updateAccount(cta, data);
    } catch (error) {
      return this.buildBcbErrorResponse(error);
    }
  }

  @Get('bcb.status')
  @ApiOperation({ summary: 'Verificar disponibilidad BCB' })
  async bcbStatus() {
    return await this.bcbService.status();
  }

  private buildBcbErrorResponse(error: any) {
    const statusCode = error instanceof HttpException ? error.getStatus() : error?.status;
    const response = error instanceof HttpException ? error.getResponse() : error?.response;
    const message =
      typeof response === 'string'
        ? response
        : response?.mensaje ||
          response?.message ||
          error?.message ||
          'Error al comunicarse con BCB';

    return {
      error: true,
      serviceStatus: false,
      finalizado: false,
      statusCode: statusCode ?? 500,
      message: Array.isArray(message) ? message.join(', ') : message,
      data: typeof response === 'object' ? response : null,
    };
  }
}
