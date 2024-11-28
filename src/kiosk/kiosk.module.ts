import { Module } from '@nestjs/common';
import { KioskController } from './kiosk.controller';
import { NatsModule } from 'src/transports/nats.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [KioskController],
  providers: [],
  imports: [NatsModule, HttpModule],
})
export class KioskModule {}
