import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';

@Module({
  controllers: [SalesController],
  providers: [],
})
export class SalesModule {}
