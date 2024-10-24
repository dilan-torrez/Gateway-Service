import { Module } from '@nestjs/common';
import { NatsModule } from 'src/transports/nats.module';
import {
  CategoriesController,
  ProcedureDocumentsController ,
  CitiesController,
  DegreesController,
  FinancialEntitiesController,
  KinshipsController,
  PensionEntitiesController,
  UnitsController,
  ModulesController,
} from './';

@Module({
  controllers: [
    ProcedureDocumentsController,
    CategoriesController,
    CitiesController,
    DegreesController,
    FinancialEntitiesController,
    KinshipsController,
    PensionEntitiesController,
    UnitsController,
    ModulesController,
  ],
  providers: [],
  imports: [NatsModule],
})
export class GeneralModule {}
