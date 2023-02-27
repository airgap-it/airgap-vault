import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { ContactBookSettingsPage } from './contact-book-settings.page'

const routes: Routes = [
  {
    path: '',
    component: ContactBookSettingsPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [ContactBookSettingsPage]
})
export class ContactBookOnboardingPageModule {}
