import { CommonModule } from '@angular/common'
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { OnboardingWelcomePage } from './onboarding-welcome.page'

const routes: Routes = [
  {
    path: '',
    component: OnboardingWelcomePage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [OnboardingWelcomePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OnboardingWelcomePageModule {}
