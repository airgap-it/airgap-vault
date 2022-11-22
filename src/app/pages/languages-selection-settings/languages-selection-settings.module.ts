import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { LanguagesSelectionSettingsPage } from './languages-selection-settings.page'

const routes: Routes = [
  {
    path: '',
    component: LanguagesSelectionSettingsPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [LanguagesSelectionSettingsPage]
})
export class LanguagesSelectionSettingsPageModule {}
