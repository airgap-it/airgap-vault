import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { SecretGenerateOnboardingPage } from './secret-generate-onboarding.page'

const routes: Routes = [
  {
    path: '',
    component: SecretGenerateOnboardingPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [SecretGenerateOnboardingPage]
})
export class SecretGenerateOnboardingPageModule {}
