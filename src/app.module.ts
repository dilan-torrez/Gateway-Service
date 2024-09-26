import { Module } from '@nestjs/common';
import { NatsModule } from './transports/nats.module';
import { AuthModule } from './auth/auth.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { PersonsModule } from './persons/persons.module';
import { ProcedureDocumentsModule } from './general/procedure-documents/procedure-documents.module';

@Module({
  imports: [
    NatsModule,
    AuthModule,
    HealthCheckModule,
    PersonsModule,
    ProcedureDocumentsModule,
  ],
})
export class AppModule {}
