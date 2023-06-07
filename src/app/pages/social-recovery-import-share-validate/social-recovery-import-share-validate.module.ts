import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { SocialRecoveryImportShareValidatePage } from './social-recovery-import-share-validate.page'

const routes: Routes = [
  {
    path: '',
    component: SocialRecoveryImportShareValidatePage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [SocialRecoveryImportShareValidatePage]
})
export class SocialRecoveryImportShareValidatePageModule {}
