import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { LinkPagePageRoutingModule } from './link-page-routing.module'

import { LinkPagePage } from './link-page.page'
import { AirGapAngularCoreModule } from '@airgap/angular-core'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, LinkPagePageRoutingModule, AirGapAngularCoreModule, TranslateModule],
  declarations: [LinkPagePage]
})
export class LinkPagePageModule {}
