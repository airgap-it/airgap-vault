import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { IsolatedModulesListPageRoutingModule } from './isolated-modules-list-routing.module'

import { IsolatedModulesListPage } from './isolated-modules-list.page'
import { TranslateModule } from '@ngx-translate/core'

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
    AirGapAngularCoreModule
  ],
  declarations: [IsolatedModulesListPage]
})
export class IsolatedModulesListPageModule {}
