import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { AdvancedSettingsPageRoutingModule } from './advanced-settings-routing.module'

import { AdvancedSettingsPage } from './advanced-settings.page'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, AdvancedSettingsPageRoutingModule],
  declarations: [AdvancedSettingsPage]
})
export class AdvancedSettingsPageModule {}
