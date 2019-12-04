import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { QRCodeModule } from 'angularx-qrcode'

import { ComponentsModule } from '../../components/components.module'

import { AccountSharePage } from './account-share.page'

const routes: Routes = [
  {
    path: '',
    component: AccountSharePage
  }
]

@NgModule({
  imports: [CommonModule, ComponentsModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule, QRCodeModule],
  declarations: [AccountSharePage]
})
export class AccountSharePageModule {}
