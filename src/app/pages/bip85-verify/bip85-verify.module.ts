import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { Bip85VerifyPageRoutingModule } from './bip85-verify-routing.module'

import { Bip85VerifyPage } from './bip85-verify.page'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, Bip85VerifyPageRoutingModule, TranslateModule],
  declarations: [Bip85VerifyPage]
})
export class Bip85VerifyPageModule {}
