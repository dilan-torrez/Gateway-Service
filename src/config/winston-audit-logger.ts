import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import { Client } from 'pg';
import { PostgresTransport } from './postgresTransport';
import 'winston-daily-rotate-file';
import { envs } from './envs';

// Configura el cliente de PostgreSQL
const pgClient = new Client({
  host: envs.dbHost,
  port: envs.dbPort,
  user: envs.dbUsername,
  password: envs.dbPassword,
  database: envs.dbName,
});
pgClient.connect();

export const auditLogger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('Gateway', {
          colors: true,
          prettyPrint: true,
          processId: true,
          appName: true,
        }),
      ),
      level: 'silly',
    }),
    new PostgresTransport({
      client: pgClient,
      level: 'http',
    }),
    new winston.transports.File({ filename: 'logs/records.log', level: 'http' }),
    new winston.transports.DailyRotateFile({
      dirname: 'logs', // Carpeta para almacenar logs
      filename: 'record-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d', // Mantener logs por 30 días
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      level: 'http',
    }),
    ,
  ],
});
