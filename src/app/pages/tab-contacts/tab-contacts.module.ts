import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { IonicModule } from '@ionic/angular'

import { TabContactsPage } from './tab-contacts.page'
import { TranslateModule } from '@ngx-translate/core'
import { ComponentsModule } from '@airgap/angular-core'
import { PipesModule } from 'src/app/pipes/pipes.module'
import { RouterModule, Routes } from '@angular/router'
import { FormsModule } from '@angular/forms'

const routes: Routes = [
  {
    path: '',
    component: TabContactsPage
  }
]

@NgModule({
  imports: [CommonModule, ComponentsModule, RouterModule.forChild(routes), IonicModule, TranslateModule, PipesModule, FormsModule],
  declarations: [TabContactsPage]
})
export class TabContactsPageModule {}
