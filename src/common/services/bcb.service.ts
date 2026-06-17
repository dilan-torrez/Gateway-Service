import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { bcbEnvs } from 'src/config/envs';

@Injectable()
export class BcbService {
  private readonly bcbUrl = bcbEnvs.bcbUrl;
  private readonly bcbEntityId = bcbEnvs.bcbEntityId;
  private readonly bcbKeyId = bcbEnvs.bcbKeyId;
  private readonly bcbSecret = bcbEnvs.bcbSecret;
  private readonly bcbToken = bcbEnvs.bcbToken;
  private readonly validQrStatuses = ['PROCESADO', 'RECHAZADO', 'NO PROCESADO'];

  constructor(private readonly httpService: HttpService) {}

  async status() {
    return await this.checkBcbStatus();
  }

  async generateQr(data: any) {
    const response = await this.send('POST', 'v1/qr', data);

    this.validateFinalizedResponse(response);

    if (!response?.datos?.idQr || !response?.datos?.imagenQr) {
      throw new HttpException(
        {
          finalizado: false,
          mensaje: 'BCB no devolvió idQr o imagenQr en la generación de QR',
          datos: response,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    return {
      ...response,
      serviceStatus: true,
    };
  }

  async qrStatus(qrId: string) {
    if (!qrId) {
      throw new BadRequestException('El id QR es obligatorio');
    }

    const response = await this.send('GET', `v1/qr/${qrId}`);

    this.validateFinalizedResponse(response);

    return {
      ...response,
      serviceStatus: true,
      statusValidation: this.buildQrStatusValidation(response),
    };
  }

  async notifications(data: any) {
    const errors = this.validateNotificationPayload(data);

    if (errors.length > 0) {
      throw new BadRequestException({
        finalizado: false,
        mensaje: 'Notificación BCB inválida',
        errores: errors,
      });
    }

    return {
      finalizado: true,
      mensaje: 'Notificación BCB recibida correctamente',
      datos: data,
      serviceStatus: true,
      statusValidation: {
        isValid: true,
        status: data.estado,
        isPaid: data.estado === 'PROCESADO',
        isRejected: data.estado === 'RECHAZADO',
        isPending: data.estado === 'NO PROCESADO',
        allowedStatuses: this.validQrStatuses,
      },
    };
  }

  async entities() {
    const response = await this.send('GET', `v1/entidades/${this.bcbEntityId}`);

    this.validateFinalizedResponse(response);

    return {
      ...response,
      serviceStatus: true,
    };
  }

  async send(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', endpoint: string, data?: any) {
    try {
      this.validateConfig();

      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

      if (path !== '/') {
        await this.checkBcbStatus();
      }

      const currentDate = new Date().toUTCString();

      const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
      const bodyString = hasBody ? JSON.stringify(data ?? {}) : undefined;

      const digestInput = hasBody ? bodyString : this.buildSigningPath(path);
      const computedDigest = await this.generateSha512Digest(digestInput);

      const headerHash = {
        'X-Date': currentDate,
        'X-Digest': computedDigest,
        'X-Entity-Id': this.bcbEntityId,
      };

      const signature = await this.computeHttpSignature(
        {
          algorithm: 'HmacSHA256',
          keyid: this.bcbKeyId,
          secretkey: this.bcbSecret,
          headers: ['X-Date', 'X-Digest', 'X-Entity-Id'],
        },
        headerHash,
      );

      const headers = {
        ...headerHash,
        'X-Signature': signature,
        Authorization: `Bearer ${this.bcbToken}`,
        'Content-Type': 'application/json',
      };

      const response$ = this.httpService.request({
        method,
        url: this.buildUrl(path),
        headers,
        data: bodyString,
        timeout: 15000,
        transformRequest: [(requestData) => requestData],
      });

      const { data: responseData, status } = await firstValueFrom(response$);

      if (status < 200 || status >= 300) {
        throw new HttpException(responseData || 'BCB respondió con estado HTTP inválido', status);
      }

      return responseData;
    } catch (error: any) {
      this.throwBcbHttpError(error);
    }
  }

  private async generateSha512Digest(data: string): Promise<string> {
    const hash = crypto.createHash('sha512').update(data, 'utf8').digest('base64');

    return `SHA-512=${hash}`;
  }

  private async computeHttpSignature(
    config: {
      algorithm: string;
      keyid: string;
      secretkey: string;
      headers: string[];
    },
    headerHash: Record<string, string>,
  ): Promise<string> {
    let signingBase = '';

    config.headers.forEach((h, index) => {
      if (index > 0) signingBase += '\n';
      signingBase += `${h.toLowerCase()}: ${headerHash[h]}`;
    });

    const secretKeyBuffer = Buffer.from(config.secretkey, 'utf8');

    const signature = crypto
      .createHmac('sha256', secretKeyBuffer)
      .update(signingBase, 'utf8')
      .digest('base64');

    return `keyid="${config.keyid}", algorithm="${config.algorithm}", headers="${config.headers.join(
      ' ',
    )}", signature="${signature}"`;
  }

  private async checkBcbStatus() {
    try {
      if (!this.bcbUrl) {
        throw new HttpException('BCB_URL no está configurado', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const response$ = this.httpService.request({
        method: 'GET',
        url: this.buildUrl('/'),
        timeout: 5000,
      });

      const { data, status } = await firstValueFrom(response$);

      if (status === HttpStatus.NOT_FOUND) {
        throw new HttpException(
          {
            finalizado: false,
            mensaje: 'Status BCB inválido: el endpoint base respondió 404',
          },
          HttpStatus.BAD_GATEWAY,
        );
      }

      if (status < 200 || status >= 300) {
        throw new HttpException(
          {
            finalizado: false,
            mensaje: `Status BCB inválido: HTTP ${status}`,
            datos: data,
          },
          HttpStatus.BAD_GATEWAY,
        );
      }

      this.validateFinalizedResponse(data);

      return {
        ...data,
        serviceStatus: true,
      };
    } catch (error: any) {
      this.throwBcbHttpError(error);
    }
  }

  private validateConfig() {
    const missing = [
      ['BCB_URL', this.bcbUrl],
      ['BCB_ENTITY_ID', this.bcbEntityId],
      ['BCB_KEY_ID', this.bcbKeyId],
      ['BCB_SECRET', this.bcbSecret],
      ['BCB_TOKEN', this.bcbToken],
    ]
      .filter(([, value]) => !value)
      .map(([name]) => name);

    if (missing.length > 0) {
      throw new HttpException(
        `Configuración BCB incompleta: ${missing.join(', ')}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private buildUrl(path: string) {
    const baseUrl = this.bcbUrl.replace(/\/+$/, '');
    return path === '/' ? `${baseUrl}/` : `${baseUrl}${path}`;
  }

  private buildSigningPath(path: string) {
    const url = new URL(this.buildUrl(path));
    return `${url.pathname}${url.search}`;
  }

  private validateFinalizedResponse(response: any) {
    if (response && typeof response === 'object' && response.finalizado === false) {
      throw new HttpException(response, HttpStatus.BAD_GATEWAY);
    }
  }

  private buildQrStatusValidation(response: any) {
    const orders = Array.isArray(response?.datos?.ordenes) ? response.datos.ordenes : [];
    const statuses = orders.map((order: any) => order?.estado).filter(Boolean);
    const invalidStatuses = statuses.filter(
      (status: string) => !this.validQrStatuses.includes(status),
    );

    return {
      isValid: invalidStatuses.length === 0,
      qrId: response?.datos?.idQr,
      statuses,
      invalidStatuses,
      isPaid: statuses.includes('PROCESADO'),
      isRejected: statuses.includes('RECHAZADO'),
      isPending: statuses.length === 0 || statuses.includes('NO PROCESADO'),
      allowedStatuses: this.validQrStatuses,
    };
  }

  private validateNotificationPayload(data: any) {
    const errors: string[] = [];
    const requiredFields = ['idQR', 'eif', 'codMoneda', 'estado'];

    requiredFields.forEach((field) => {
      if (!data?.[field]) {
        errors.push(`${field}: es obligatorio`);
      }
    });

    if (data?.estado && !this.validQrStatuses.includes(data.estado)) {
      errors.push(`estado: debe ser uno de ${this.validQrStatuses.join(', ')}`);
    }

    return errors;
  }

  private throwBcbHttpError(error: any): never {
    if (error instanceof HttpException) {
      throw error;
    }

    const status = error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const responseData = error?.response?.data;

    if (status === HttpStatus.NOT_FOUND) {
      throw new HttpException(
        responseData || {
          finalizado: false,
          mensaje: 'BCB respondió 404: endpoint o recurso no encontrado',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    throw new HttpException(responseData || 'Error connecting to BCB service', status);
  }
}
