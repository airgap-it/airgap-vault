import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { SecretSeedqrFormatPage } from './secret-seedqr-format.page'

const routes: Routes = [
  {
    path: '',
    component: SecretSeedqrFormatPage
  }
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule
  ],
  declarations: [SecretSeedqrFormatPage]
})
export class SecretSeedqrFormatPageModule {}