import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { citizenshipDigitalEnvs } from 'src/config/envs';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CitizenshipDigitalService {
  private readonly credentials = {
    clientUrl: citizenshipDigitalEnvs.clientUrl,
    clientId: citizenshipDigitalEnvs.clientId,
    redirectUri: citizenshipDigitalEnvs.redirectUri,
    scopes: citizenshipDigitalEnvs.scopes,
  };

  constructor(private readonly httpService: HttpService) {}

  async citizenshipDigitalCredentials() {
    return this.credentials;
  }

  async findPerson(body: any) {
    try {
      const { code, codeVerifier } = body;

      const tokenUrl = `${this.credentials.clientUrl}/token`;

      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', this.credentials.redirectUri);
      params.append('code_verifier', codeVerifier);
      params.append('code', code);
      params.append('client_id', this.credentials.clientId);
      const tokenResponse = await firstValueFrom(numeroCI
        this.httpService.post(tokenUrl, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      const { access_token, id_token } = tokenResponse.data;

      if (!access_token) {
        throw new HttpException('No se obtuvo access_token', 500);
      }

      const getPerson = await firstValueFrom(
        this.httpService.get(`${this.credentials.clientUrl}/me`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }),
      );

      const urlLogout =
        `${this.credentials.clientUrl}/session/end?` +
        `id_token_hint=${encodeURIComponent(id_token)}` +
        `&post_logout_redirect_uri=${encodeURIComponent('com.muserpol.pvt:/oauth2redirect')}`;
      return {
        profile: getPerson.data.profile,
        cellphone: getPerson.data.celular,
        urlLogout,
      };
    } catch (error) {
      throw new HttpException('Error consultando ciudadanía digital', HttpStatus.BAD_GATEWAY);
    }
  }
}
