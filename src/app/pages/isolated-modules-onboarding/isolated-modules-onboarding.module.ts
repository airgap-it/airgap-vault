import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { IsolatedModulesOnboardingPage } from './isolated-modules-onboarding.page'
import { TranslateModule } from '@ngx-translate/core'

import { AirGapAngularCoreModule } from '@airgap/angular-core'
import { RouterModule, Routes } from '@angular/router'
import { ComponentsModule } from '../../components/components.module'

const routes: Routes = [
  {
    path: '',
    component: IsolatedModulesOnboardingPage
  }
]

@NgModule({
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ComponentsModule,
    AirGapAngularCoreModule
  ],
  declarations: [IsolatedModulesOnboardingPage]
})
export class IsolatedModulesOnboardingPageModule {}
