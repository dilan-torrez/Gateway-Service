import { Module } from '@nestjs/common';
import { AffiliatesController } from './affiliates.controller';

@Module({
  controllers: [AffiliatesController],
  providers: [],
  imports: [],
})
export class AffiliatesModule {}
