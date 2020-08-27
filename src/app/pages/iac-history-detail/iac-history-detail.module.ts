import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { IacHistoryDetailPageRoutingModule } from './iac-history-detail-routing.module'

import { IacHistoryDetailPage } from './iac-history-detail.page'
import { AirGapAngularCoreModule } from '@airgap/angular-core'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, IacHistoryDetailPageRoutingModule, AirGapAngularCoreModule],
  declarations: [IacHistoryDetailPage]
})
export class IacHistoryDetailPageModule {}
