import { AirGapAngularCoreModule } from '@airgap/angular-core'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { TranslateModule } from '@ngx-translate/core'

import { ComponentsModule } from '../../components/components.module'

import { AccountShareSelectPageRoutingModule } from './account-share-select-routing.module'
import { AccountShareSelectEffects } from './account-share-select.effects'
import { AccountShareSelectPage } from './account-share-select.page'
import * as fromAccountShareSelect from './account-share-select.reducers'

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    AccountShareSelectPageRoutingModule,
    StoreModule.forFeature('accountShareSelect', fromAccountShareSelect.reducer),
    EffectsModule.forFeature([AccountShareSelectEffects]),
    AirGapAngularCoreModule
  ],
  declarations: [AccountShareSelectPage]
})
export class AccountShareSelectPageModule {}
