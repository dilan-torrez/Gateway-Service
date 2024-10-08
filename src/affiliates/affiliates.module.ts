import { Module } from '@nestjs/common';
import { AffiliatesController } from './affiliates.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [AffiliatesController],
  providers: [],
  imports: [NatsModule],
})
export class AffiliatesModule {}
