import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
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

  constructor(
    private readonly httpService: HttpService,
  ) {}

  async send(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
  ) {
    try {
      const path = endpoint.startsWith('/')
        ? endpoint
        : `/${endpoint}`;

      const currentDate = new Date().toUTCString();

      let computedDigest: string;

      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        computedDigest = await this.generateSha512Digest(
          JSON.stringify(data ?? {}),
        );
      } else {
        computedDigest = await this.generateSha512Digest(
          path,
        );
      }

      const headerHash = {
        'X-Date': currentDate,
        'X-Digest': computedDigest,
        'X-Entity-Id': this.bcbEntityId,
      };

      const signature =
        await this.computeHttpSignature(
          {
            algorithm: 'HmacSHA256',
            keyid: this.bcbKeyId,
            secretkey: this.bcbSecret,
            headers: [
              'X-Date',
              'X-Digest',
              'X-Entity-Id',
            ],
          },
          headerHash,
        );

      const headers = {
        ...headerHash,
        'X-Signature': signature,
        Authorization: `Bearer ${this.bcbToken}`,
        'Content-Type': 'application/json',
      };

      const response$ =
        this.httpService.request({
          method,
          url: `${this.bcbUrl}${path}`,
          headers,
          data,
          timeout: 15000,
        });

      const { data: responseData } =
        await firstValueFrom(response$);

      return responseData;
    } catch (error: any) {
      throw new HttpException(
        error?.response?.data ||
          'Error connecting to BCB service',
        error?.response?.status ||
          HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async generateSha512Digest(
    data: string,
  ): Promise<string> {
    const hash = crypto
      .createHash('sha512')
      .update(data, 'utf8')
      .digest('base64');

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

    const secretKeyBuffer = Buffer.from(
      config.secretkey,
      'utf8',
    );

    const signature = crypto
      .createHmac('sha256', secretKeyBuffer)
      .update(signingBase, 'utf8')
      .digest('base64');

    return `keyid="${config.keyid}", algorithm="${config.algorithm}", headers="${config.headers.join(
      ' ',
    )}", signature="${signature}"`;
  }

  public async notifications(){
    console.log("hola");
    return "hola";
  }
}
