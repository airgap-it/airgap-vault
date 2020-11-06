import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { Bip85ShowPageRoutingModule } from './bip85-show-routing.module'

import { Bip85ShowPage } from './bip85-show.page'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, Bip85ShowPageRoutingModule, TranslateModule],
  declarations: [Bip85ShowPage]
})
export class Bip85ShowPageModule {}
