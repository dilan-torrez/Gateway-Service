import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';
import { NatsService, RecordService } from 'src/common';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger('AuthGuard');
  constructor(
    private nats: NatsService,
    private readonly recordService: RecordService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    let username: string;
    if (!token) {
      throw new NotFoundException({ error: true, message: 'Token no encontrado' });
    }
    try {
      username = (await this.nats.firstValue('auth.verify', token)).username;
      request['user'] = username;
      return true;
    } catch {
      this.recordService.warn({ ip: request.ip, message: 'Sin autorización' });
      throw new UnauthorizedException({ error: true, message: 'Sin autorización' });
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const cookies = request.headers['set-cookie'];
    let token = undefined;
    const cookie = cookies?.find((e) => {
      let [type, value] = e?.split('=') ?? [];
      if (!value) return null;
      if (value.slice(-1) == ';') {
        value = value.slice(0, -1);
      }
      if (type === 'msp') {
        token = value;
        return true;
      }
      return false;
    });

    return token;
  }
}
