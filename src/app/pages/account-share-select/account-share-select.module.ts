import { AirGapAngularCoreModule } from '@airgap/angular-core'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { TranslateModule } from '@ngx-translate/core'

import { ComponentsModule } from '../../components/components.module'
import { AccountShareSelectPage } from './account-share-select.page'
import { AccountShareSelectEffects } from './account-share-select.effects'
import * as fromAccountShareSelect from './account-share-select.reducers'
import { AccountShareSelectRoutingModule } from './account-share-select-routing.module'

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    AccountShareSelectRoutingModule,
    StoreModule.forFeature('accountShareSelect', fromAccountShareSelect.reducer),
    EffectsModule.forFeature([AccountShareSelectEffects]),
    AirGapAngularCoreModule
  ],
  declarations: [AccountShareSelectPage]
})
export class AccountShareSelectPageModule {}
