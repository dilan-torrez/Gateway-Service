import { Module } from '@nestjs/common';
import { ProcedureDocumentsController } from './procedure-documents.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [ProcedureDocumentsController],
  providers: [],
  imports: [NatsModule],
})
export class ProcedureDocumentsModule {}
