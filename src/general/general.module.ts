import { Module } from '@nestjs/common';
import {
  CategoriesController,
  ProcedureDocumentsController,
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
  imports: [],
})
export class GeneralModule {}
