import { AirGapAngularCoreModule } from '@airgap/angular-core'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { TranslateModule } from '@ngx-translate/core'

import { ComponentsModule } from '../../components/components.module'

import { MigrationPageRoutingModule } from './migration-routing.module'
import { MigrationEffects } from './migration.effects'
import { MigrationPage } from './migration.page'
import * as fromMigration from './migration.reducers'

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    MigrationPageRoutingModule,
    StoreModule.forFeature('migration', fromMigration.reducer),
    EffectsModule.forFeature([MigrationEffects]),
    AirGapAngularCoreModule
  ],
  declarations: [MigrationPage]
})
export class MigrationPageModule {}
