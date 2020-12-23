import { AirGapAngularCoreModule } from '@airgap/angular-core'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { SelectAccountPage } from './select-account.page'
import { RouterModule, Routes } from '@angular/router'
import { ComponentsModule } from 'src/app/components/components.module'

const routes: Routes = [
  {
    path: '',
    component: SelectAccountPage
  }
]
@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), ComponentsModule, AirGapAngularCoreModule],
  declarations: [SelectAccountPage]
})
export class SelectAccountPageModule {}
