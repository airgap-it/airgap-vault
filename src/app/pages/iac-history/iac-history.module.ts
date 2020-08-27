import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { IacHistoryPageRoutingModule } from './iac-history-routing.module'

import { IacHistoryPage } from './iac-history.page'
import { AirGapAngularCoreModule, PipesModule } from '@airgap/angular-core'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, IacHistoryPageRoutingModule, PipesModule, AirGapAngularCoreModule],
  declarations: [IacHistoryPage]
})
export class IacHistoryPageModule {}
