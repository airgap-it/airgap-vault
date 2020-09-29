import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { ThresholdsAccountPageRoutingModule } from './thresholds-account-routing.module'

import { ThresholdsAccountPage } from './thresholds-account.page'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ThresholdsAccountPageRoutingModule],
  declarations: [ThresholdsAccountPage]
})
export class ThresholdsAccountPageModule {}
