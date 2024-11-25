import { Controller, Get, HttpException, Inject, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { catchError } from 'rxjs';
import { NATS_SERVICE } from 'src/config';

@Controller('kiosk')
@ApiTags('kiosk')
export class KioskController {
  constructor(
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  @Get('person/:identityCard')
  @ApiResponse({
    status: 200,
    description: 'Mostrar el listado de huellas digitales',
  })
  async showListFingerprint(@Param('identityCard') identityCard: string) {
    return this.client.send('kiosk.getDataPerson', identityCard).pipe(
      catchError((err) => {
        throw new HttpException(err, err.statusCode);
      }),
    );
  }
}
