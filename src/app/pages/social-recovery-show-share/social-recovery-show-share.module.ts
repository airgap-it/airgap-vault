import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { SocialRecoveryShowSharePage } from './social-recovery-show-share.page'

const routes: Routes = [
  {
    path: '',
    component: SocialRecoveryShowSharePage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [SocialRecoveryShowSharePage]
})
export class SocialRecoveryShowSharePageModule {}
