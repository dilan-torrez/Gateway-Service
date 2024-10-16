import { Module } from '@nestjs/common';
import { PersonsController } from './persons.controller';
import { NatsModule } from '../transports/nats.module';

@Module({
  controllers: [PersonsController],
  providers: [],
  imports: [NatsModule],
})
export class PersonsModule {}
