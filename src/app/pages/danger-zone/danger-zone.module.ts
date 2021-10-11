import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { DangerZonePageRoutingModule } from './danger-zone-routing.module'

import { DangerZonePage } from './danger-zone.page'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, DangerZonePageRoutingModule, TranslateModule],
  declarations: [DangerZonePage]
})
export class DangerZonePageModule {}
