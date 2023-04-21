import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { ComponentsModule } from 'src/app/components/components.module'
import { SocialRecoveryGenerateShareValidatePage } from './social-recovery-generate-share-validate.page'

const routes: Routes = [
  {
    path: '',
    component: SocialRecoveryGenerateShareValidatePage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule, ComponentsModule],
  declarations: [SocialRecoveryGenerateShareValidatePage]
})
export class SocialRecoveryGenerateShareValidatePageModule {}
