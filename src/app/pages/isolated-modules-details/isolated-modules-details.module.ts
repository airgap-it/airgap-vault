import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { IsolatedModulesDetailsPage as IsolatedModulesDetailsPage } from './isolated-modules-details.page'
import { TranslateModule } from '@ngx-translate/core'

import { AirGapAngularCoreModule } from '@airgap/angular-core'
import { RouterModule, Routes } from '@angular/router'
import { ComponentsModule } from '../../components/components.module'
import { IsolatedModulesDetailsPopoverComponent } from './popover/isolated-modules-details-popover.component'

const routes: Routes = [
  {
    path: '',
    component: IsolatedModulesDetailsPage
  }
]

@NgModule({
  entryComponents: [IsolatedModulesDetailsPopoverComponent],
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ComponentsModule,
    AirGapAngularCoreModule
  ],
  declarations: [
    IsolatedModulesDetailsPage,
    IsolatedModulesDetailsPopoverComponent
  ]
})
export class IsolatedModulesDetailsPageModule {}
