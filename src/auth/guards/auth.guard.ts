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
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger('AuthGuard');
  constructor(
    private nats: NatsService,
    private readonly recordService: RecordService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
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
        const username = (await this.nats.firstValue('auth.verify.token', token))
          .username as string;
        request['user'] = username;
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
