import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { NatsService } from '../common/nats/nats.service';

@Module({
  controllers: [AuthController],
  providers: [NatsService],
  exports: [NatsService],
})
export class AuthModule {}
