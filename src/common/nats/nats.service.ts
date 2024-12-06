import { HttpException, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError } from 'rxjs/operators';
import { NATS_SERVICE } from '../../config';
import { firstValueFrom } from 'rxjs';

export class NatsService {
  private logger = new Logger('MicroserviceUtils');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async send(service: string, data: any): Promise<any> {
    return this.client.send(service, data).pipe(
      catchError((err) => {
        throw new HttpException(err, err.statusCode);
      }),
    );
  }

  async firstValue(service: string, data: any): Promise<any> {
    return firstValueFrom(
      this.client.send(service, data).pipe(
        catchError((err) => {
          throw new HttpException(err, err.statusCode);
        }),
      ),
    );
  }
}
