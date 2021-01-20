import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { TotpSetupPageRoutingModule } from './totp-setup-routing.module'

import { TotpSetupPage } from './totp-setup.page'
import { AirGapAngularCoreModule } from '@airgap/angular-core'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, TotpSetupPageRoutingModule, AirGapAngularCoreModule],
  declarations: [TotpSetupPage]
})
export class TotpSetupPageModule {}
