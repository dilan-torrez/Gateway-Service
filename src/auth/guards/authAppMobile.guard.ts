import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { NatsService } from 'src/common';

@Injectable()
export class AuthAppMobileGuard implements CanActivate {
  private readonly logger = new Logger('AuthAppMobileGuard');
  constructor(private nats: NatsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Envíe un token de autorización');
    }

    const apiToken = authHeader.split(' ')[1];

    const response = await this.nats.firstValue('auth.verifyApiTokenAppMobile', { apiToken });

    const { error, message } = response;

    if (error) {
      throw new UnauthorizedException({ error: true, message: 'Sin autorización, ' + message });
    }
    const user = {
      affiliateId: response.affiliateId,
      tokenId: response.tokenId,
    };

    request.user = user;

    return true;
  }
}
