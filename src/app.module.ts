import { Module } from '@nestjs/common';
import { AffiliatesModule } from './affiliates/affiliates.module';
import { AuthModule } from './auth/auth.module';
import { GeneralModule } from './general/general.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { PersonsModule } from './persons/persons.module';
import { NatsModule } from './transports/nats.module';

@Module({
  imports: [
    NatsModule,
    AuthModule,
    HealthCheckModule,
    PersonsModule,
    GeneralModule,
    AffiliatesModule,
  ],
})
export class AppModule {}
