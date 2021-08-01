import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { GuidesPageRoutingModule } from './guides-routing.module'

import { GuidesPage } from './guides.page'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, GuidesPageRoutingModule, TranslateModule],
  declarations: [GuidesPage]
})
export class GuidesPageModule {}
