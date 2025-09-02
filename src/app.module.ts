import { Module } from '@nestjs/common';
import { AffiliatesModule } from './affiliates/affiliates.module';
import { AuthModule } from './auth/auth.module';
//import { GeneralModule } from './general/general.module';
import { PersonsModule } from './persons/persons.module';
import { KioskModule } from './kiosk/kiosk.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { PvtBeModule } from './pvt-be/pvt-be.module';
import { PvtStiModule } from './pvt-sti/pvt-sti.module';
import { AppMobileModule } from './app-mobile/app-mobile.module';

@Module({
  imports: [
    AuthModule,
    PersonsModule,
    //GeneralModule,
    AffiliatesModule,
    KioskModule,
    CommonModule,
    DatabaseModule,
    PvtBeModule,
    PvtStiModule,
    AppMobileModule,
  ],
})
export class AppModule {}
