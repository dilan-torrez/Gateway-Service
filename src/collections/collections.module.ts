import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';

@Module({
  controllers: [CollectionsController],
  providers: [],
})
export class CollectionsModule {}
