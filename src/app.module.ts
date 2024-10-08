import { Module } from '@nestjs/common';
import { NatsModule } from './transports/nats.module';
import { AuthModule } from './auth/auth.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { PersonsModule } from './persons/persons.module';
import { ProcedureDocumentsModule } from './general/procedure-documents/procedure-documents.module';
import { AffiliatesModule } from './affiliates/affiliates.module';

@Module({
  imports: [
    NatsModule,
    AuthModule,
    HealthCheckModule,
    PersonsModule,
    ProcedureDocumentsModule,
    AffiliatesModule,
  ],
})
export class AppModule {}
