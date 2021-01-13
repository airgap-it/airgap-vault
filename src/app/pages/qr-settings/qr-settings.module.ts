import { AirGapAngularCoreModule } from '@airgap/angular-core'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { ComponentsModule } from '../../components/components.module'
import { QrSettingsPage } from './qr-settings.page'

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ComponentsModule,
    TranslateModule,
    RouterModule.forChild([{ path: '', component: QrSettingsPage }]),
    AirGapAngularCoreModule
  ],
  declarations: [QrSettingsPage]
})
export class QrSettingsPageModule {}
