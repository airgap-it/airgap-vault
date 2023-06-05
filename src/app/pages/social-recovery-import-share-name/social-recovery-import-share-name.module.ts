import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { SocialRecoveryImportShareNamePage } from './social-recovery-import-share-name.page'

const routes: Routes = [
  {
    path: '',
    component: SocialRecoveryImportShareNamePage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [SocialRecoveryImportShareNamePage]
})
export class SocialRecoveryImportShareNamePageModule {}
