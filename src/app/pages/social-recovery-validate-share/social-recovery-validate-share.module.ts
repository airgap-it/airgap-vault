import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { ComponentsModule } from '../../components/components.module'

import { SocialRecoveryValidateSharePage } from './social-recovery-validate-share.page'

const routes: Routes = [
  {
    path: '',
    component: SocialRecoveryValidateSharePage
  }
]

@NgModule({
  imports: [CommonModule, ComponentsModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [SocialRecoveryValidateSharePage]
})
export class SocialRecoveryValidateSharePageModule {}
