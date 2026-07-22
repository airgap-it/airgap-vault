import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { QRCodeModule } from 'angularx-qrcode'
import { RouterModule, Routes } from '@angular/router'

import { SecretSeedqrPage } from './secret-seedqr.page'

const routes: Routes = [
  {
    path: '',
    component: SecretSeedqrPage
  }
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    QRCodeModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SecretSeedqrPage]
})
export class SecretSeedqrPageModule {}