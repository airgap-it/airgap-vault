import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { TabSettingsPage } from './tab-settings.page'

const routes: Routes = [
  {
    path: '',
    component: TabSettingsPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [TabSettingsPage]
})
export class TabSettingsPageModule {}
