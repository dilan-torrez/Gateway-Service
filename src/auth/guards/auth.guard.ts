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
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger('AuthGuard');
  constructor(
    private nats: NatsService,
    private readonly recordService: RecordService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] as string;
    const token = this.extractTokenFromHeader(request);
    if (!token && !apiKey) {
      throw new NotFoundException({ error: true, message: 'Token no encontrado' });
    }
    if (!!apiKey) {
      try {
        const isValid = await this.nats.firstValue('auth.verify.apikey', apiKey);
        return isValid;
      } catch (error) {
        this.recordService.warn({ ip: request.ip, message: 'Api Key inválida' });
        throw new UnauthorizedException({ error: true, message: 'Sin autorización' });
      }
    }

    if (!!token) {
      try {
        const user = await this.nats.firstValue('auth.verify.token', token);
        request.user = user;
        return true;
      } catch {
        this.recordService.warn({ ip: request.ip, message: 'Sin autorización' });
        throw new UnauthorizedException({ error: true, message: 'Sin autorización' });
      }
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
