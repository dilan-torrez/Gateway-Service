import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger('AuthGuard');
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new NotFoundException({ error: true, message: 'Token no encontrado' });
    }
    try {
      const isTokenValid = await firstValueFrom(this.client.send('auth.verify', token));
      return isTokenValid;
    } catch {
      throw new UnauthorizedException({ error: true, message: 'Sin autorización' });
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    let [type, token] = request.headers.cookie?.split('=') ?? [];
    if (!token) return null;
    if (token.slice(-1) == ';') {
      token = token.slice(0, -1);
    }
    return type === 'Set-Cookie' ? token : undefined;
  }
}
