import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { ContactBookOnboardingPage } from './contact-book-onboarding.page'

const routes: Routes = [
  {
    path: '',
    component: ContactBookOnboardingPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [ContactBookOnboardingPage]
})
export class ContactBookOnboardingPageModule {}
