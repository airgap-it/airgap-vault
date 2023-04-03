import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { IsolatedModulesListPageRoutingModule } from './isolated-modules-list-routing.module'

import { IsolatedModulesListPage } from './isolated-modules-list.page'
import { TranslateModule } from '@ngx-translate/core'
import { StoreModule } from '@ngrx/store'

import * as fromModulePreview from './isolated-modules-list.reducer'
import { EffectsModule } from '@ngrx/effects'
import { IsolatedModulesListEffects } from './isolated-modules-list.effects'
import { AirGapAngularCoreModule } from '@airgap/angular-core'
import { ComponentsModule } from '../../components/components.module'

@NgModule({
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule, 
    IsolatedModulesListPageRoutingModule,
    TranslateModule,
    ComponentsModule,
    StoreModule.forFeature('modulePreview', fromModulePreview.reducer),
    EffectsModule.forFeature([IsolatedModulesListEffects]),
    AirGapAngularCoreModule
  ],
  declarations: [IsolatedModulesListPage]
})
export class IsolatedModulesListPageModule {}
