import { Module } from '@nestjs/common';
import { KioskController } from './kiosk.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [KioskController],
  providers: [],
  imports: [NatsModule],
})
export class KioskModule {}
