import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { InteractionSelectionSettingsPage } from './interaction-selection-settings.page'
import { ComponentsModule } from '../../components/components.module'

const routes: Routes = [
  {
    path: '',
    component: InteractionSelectionSettingsPage
  }
]

@NgModule({
  declarations: [InteractionSelectionSettingsPage],
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule, ComponentsModule]
})
export class InteractionSelectionSettingsPageModule {}
