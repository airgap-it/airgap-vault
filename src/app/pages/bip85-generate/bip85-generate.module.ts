import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { Bip85GeneratePageRoutingModule } from './bip85-generate-routing.module'

import { Bip85GeneratePage } from './bip85-generate.page'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, Bip85GeneratePageRoutingModule, TranslateModule],
  declarations: [Bip85GeneratePage]
})
export class Bip85GeneratePageModule {}
