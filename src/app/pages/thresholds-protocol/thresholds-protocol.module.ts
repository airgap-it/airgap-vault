import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { ThresholdsProtocolPageRoutingModule } from './thresholds-protocol-routing.module'

import { ThresholdsProtocolPage } from './thresholds-protocol.page'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ThresholdsProtocolPageRoutingModule],
  declarations: [ThresholdsProtocolPage]
})
export class ThresholdsProtocolPageModule {}
