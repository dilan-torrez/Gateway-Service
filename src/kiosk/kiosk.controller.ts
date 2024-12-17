import {
  Body,
  Controller,
  Get,
  Param,
  Headers,
  Res,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { PvtEnvs } from 'src/config';
import * as bcrypt from 'bcrypt';
import { HttpService } from '@nestjs/axios';
import { Response } from 'express';
import { SaveDataKioskAuthDto } from './dto/save-data-kiosk-auth.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadPhotosDto } from './dto/save-photos.dto';
import { NatsService } from 'src/common';

@Controller('kiosk')
@ApiTags('kiosk')
export class KioskController {
  constructor(
    private readonly nats: NatsService,
    private readonly httpService: HttpService,
  ) {}

  @Get('person/:identityCard')
  @ApiResponse({
    status: 200,
    description: 'Mostrar el listado de huellas digitales',
  })
  async showListFingerprint(@Param('identityCard') identityCard: string) {
    return this.nats.send('kiosk.getDataPerson', identityCard);
  }

  @Post('saveDataKioskAuth')
  @ApiBody({ type: SaveDataKioskAuthDto })
  async saveDataKioskAuth(@Body() data: SaveDataKioskAuthDto) {
    return this.nats.send('kiosk.saveDataKioskAuth', data);
  }

  @Post('savePhoto')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photoIdentityCard', maxCount: 1 },
      { name: 'photoFace', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadPhotosDto })
  async uploadPhoto(
    @UploadedFiles()
    files: { photoIdentityCard?: Express.Multer.File[]; photoFace?: Express.Multer.File[] },
    @Body() body: UploadPhotosDto,
  ) {
    const payload = {
      personId: body.personId,
      photoIdentityCard: files.photoIdentityCard?.[0]?.buffer,
      photoFace: files.photoFace?.[0]?.buffer,
    };
    return this.nats.send('kiosk.savePhotos', payload);
  }

  @Get('getFingerprintComparison/:id')
  @ApiResponse({
    status: 200,
    description: 'Mostrar el listado de huellas digitales de una persona',
  })
  async getFingerprintComparison(@Param('id') id: number) {
    return this.nats.send('kiosk.getFingerprintComparison', id);
  }

  @Get('person/:identityCard/ecoCom')
  @ApiResponse({
    status: 200,
    description: 'Verificar si puede crear complemento',
  })
  async VerifyEcoCom(
    @Headers('authorization') authorization: string,
    @Param('identityCard') identityCard: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    let hash: string;
    if (authorization && authorization.startsWith('Bearer ')) {
      hash = authorization.split(' ')[1];
    }
    // El hash2 se usa para comparar con la libreria bcrypt, es un problema de versiones con el hash nativo de laravel
    const hash2 = hash.replace(/^\$2y(.+)$/i, '$2a$1');
    const url = `${PvtEnvs.PvtBeApiServer}/kioskoComplemento?ci=${identityCard}`;
    try {
      if (await bcrypt.compare(PvtEnvs.PvtHashSecret, hash2)) {
        const { data } = await firstValueFrom(
          this.httpService.get(url, { headers: { Authorization: `Bearer ${hash}` } }),
        );
        return data;
      } else {
        res.status(401).json({
          error: true,
          message: 'Token no valido',
        });
      }
    } catch (error) {
      return error.response.data;
    }
  }

  @Get('ecoCom/:id')
  async GetEcoComKiosko(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    let hash: string;
    if (authorization && authorization.startsWith('Bearer ')) {
      hash = authorization.split(' ')[1];
    }
    // El hash2 se usa para comparar con la libreria bcrypt, es un problema de versiones con el hash nativo de laravel
    const hash2 = hash.replace(/^\$2y(.+)$/i, '$2a$1');
    const url = `${PvtEnvs.PvtBeApiServer}/eco_com/${id}`;
    try {
      if (await bcrypt.compare(PvtEnvs.PvtHashSecret, hash2)) {
        const { data } = await firstValueFrom(
          this.httpService.get(url, { headers: { Authorization: `Bearer ${hash}` } }),
        );
        return data;
      } else {
        res.status(401).json({
          error: true,
          message: 'Token no valido',
        });
      }
    } catch (error) {
      return error.response.data;
    }
  }

  @Post('ecoCom')
  async CreateEcoComKiosko(
    @Headers('authorization') authorization: string,
    @Res({ passthrough: true }) res: Response,
    @Body() body,
  ) {
    let hash: string;
    if (authorization && authorization.startsWith('Bearer ')) {
      hash = authorization.split(' ')[1];
    }
    // El hash2 se usa para comparar con la libreria bcrypt, es un problema de versiones con el hash nativo de laravel
    const hash2 = hash.replace(/^\$2y(.+)$/i, '$2a$1');
    const url = `${PvtEnvs.PvtBeApiServer}/eco_com`;
    try {
      if (await bcrypt.compare(PvtEnvs.PvtHashSecret, hash2)) {
        const { data } = await firstValueFrom(
          this.httpService.post(url, body, { headers: { Authorization: `Bearer ${hash}` } }),
        );
        return data;
      } else {
        res.status(401).json({
          error: true,
          message: 'Token no valido',
        });
      }
    } catch (error) {
      return error.response.data;
    }
  }

  @Get('procedures/:identityCard')
  @ApiResponse({
    status: 200,
    description: 'Obtener préstamos de un afiliado',
  })
  async getAffiliateLoans(
    @Headers('authorization') authorization: string,
    @Param('identityCard') identityCard: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    let hash: string;
    let ecoComResponse: any = null;
    let loansResponse: any = null;
    if (authorization && authorization.startsWith('Bearer ')) {
      hash = authorization.split(' ')[1];
    }
    const hash2 = hash?.replace(/^\$2y(.+)$/i, '$2a$1');
    const ecoComUrl = `${PvtEnvs.PvtBeApiServer}/kioskoComplemento?ci=${identityCard}`;
    const loansUrl = `${PvtEnvs.PvtBackendApiServer}/kiosk/verify_loans/${identityCard}`;
    if (hash && (await bcrypt.compare(PvtEnvs.PvtHashSecret, hash2))) {
      try {
        const { data } = await firstValueFrom(
          this.httpService.get(ecoComUrl, { headers: { Authorization: `Bearer ${hash}` } }),
        );
        ecoComResponse = data;
      } catch (error) {
        ecoComResponse = {
          error: true,
          message: error.response?.data?.message || 'Error al verificar complemento',
        };
      }

      try {
        const { data } = await firstValueFrom(this.httpService.get(loansUrl));
        loansResponse = data;
      } catch (error) {
        loansResponse = {
          error: true,
          message: error.response?.data?.message || 'Error al obtener préstamos',
        };
      }
    } else {
      res.status(401).json({
        error: true,
        message: 'Token no válido',
      });
      return;
    }
    return {
      ecoCom: ecoComResponse.error,
      loans: loansResponse.hasLoan,
    };
  }
}
