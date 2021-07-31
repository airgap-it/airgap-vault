import { AirGapAngularCoreModule } from '@airgap/angular-core'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { ComponentsModule } from '../../components/components.module'
import { PipesModule } from '../../pipes/pipes.module'

import { TabAccountsPage } from './tab-accounts.page'

const routes: Routes = [
  {
    path: '',
    component: TabAccountsPage
  }
]

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    PipesModule,
    AirGapAngularCoreModule
  ],
  declarations: [TabAccountsPage]
})
export class TabAccountsPageModule {}
