import { Injector, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { IsolatedModulesListPageRoutingModule } from './isolated-modules-list-routing.module'

import { IsolatedModulesListPage } from './isolated-modules-list.page'
import { TranslateModule } from '@ngx-translate/core'

import { AirGapAngularCoreModule, isolatedModulesListPageFacade,  ISOLATED_MODULES_LIST_PAGE_FACADE } from '@airgap/angular-core'
import { ComponentsModule } from '../../components/components.module'
import { LetDirective, PushPipe } from '@ngrx/component'

@NgModule({
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule, 
    IsolatedModulesListPageRoutingModule,
    TranslateModule,
    LetDirective,
    PushPipe,
    ComponentsModule,
    AirGapAngularCoreModule
  ],
  declarations: [IsolatedModulesListPage],
  providers: [
    { provide: ISOLATED_MODULES_LIST_PAGE_FACADE, useFactory: isolatedModulesListPageFacade, deps: [Injector] }
  ]
})
export class IsolatedModulesListPageModule {}
