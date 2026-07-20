import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_SERVICE, NastEnvs } from 'src/config';
import {
  NatsService,
  FtpService,
  SmsService,
  WhatsappService,
  CitizenshipDigitalService,
  BcbService,
} from 'src/common';
import { CommonController } from './common.controller';
import { NotificationsController } from './notifications.controller';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  controllers: [CommonController, NotificationsController],
  imports: [
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: NastEnvs.natsServers,
        },
      },
    ]),
    HttpModule,
  ],
  providers: [
    NatsService,
    FtpService,
    SmsService,
    WhatsappService,
    CitizenshipDigitalService,
    BcbService,
  ],
  exports: [
    ClientsModule,
    NatsService,
    FtpService,
    SmsService,
    WhatsappService,
    CitizenshipDigitalService,
    BcbService,
    HttpModule,
  ],
})
export class CommonModule {}
