import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { SocialRecoveryImportSuccessPage } from './social-recovery-import-success.page'

const routes: Routes = [
  {
    path: '',
    component: SocialRecoveryImportSuccessPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [SocialRecoveryImportSuccessPage]
})
export class SocialRecoveryImportSuccessPageModule {}
