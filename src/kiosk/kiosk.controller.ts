import { Body, Controller, Get, HttpException, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { catchError } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { SaveDataKioskAuthDto } from './dto/save-data-kiosk-auth.dto';

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
  @Post('saveDataKioskAuth')
  @ApiBody({ type: SaveDataKioskAuthDto })
  async saveDataKioskAuth(@Body() data: SaveDataKioskAuthDto) {
    return this.client.send('kiosk.saveDataKioskAuth', data).pipe(
      catchError((err) => {
        throw new HttpException(err, err.statusCode);
      }),
    );
  }
}
