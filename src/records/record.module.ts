import { Global, Module } from '@nestjs/common';
import { RecordService } from './record.service';
import { auditLogger } from '../config/winston-audit-logger';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Global()
@Module({
  providers: [RecordService, { provide: WINSTON_MODULE_PROVIDER, useValue: auditLogger }],
  exports: [RecordService],
})
export class RecordModule {}
