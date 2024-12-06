import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_SERVICE, NastEnvs } from 'src/config';
import { NatsService, RecordService } from './';
import { auditLogger } from 'src/config/winston-audit-logger';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: NastEnvs.natsServers,
        },
      },
    ]),
  ],
  providers: [
    NatsService,
    RecordService,
    { provide: WINSTON_MODULE_PROVIDER, useValue: auditLogger },
  ],
  exports: [
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: NastEnvs.natsServers,
        },
      },
    ]),
    NatsService,
    RecordService,
  ],
})
export class CommonModule {}
