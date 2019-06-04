import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { TabAccountsPage } from './tab-accounts.page'

import { TranslateModule } from '@ngx-translate/core'
import { ComponentsModule } from '../../components/components.module'
import { PipesModule } from '../../pipes/pipes.modules'

const routes: Routes = [
  {
    path: '',
    component: TabAccountsPage
  }
]

@NgModule({
  imports: [CommonModule, ComponentsModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule, PipesModule],
  declarations: [TabAccountsPage]
})
export class TabAccountsPageModule {}
