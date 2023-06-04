import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { AccountsListPageRoutingModule } from './accounts-list-routing.module'

import { AccountsListPage } from './accounts-list.page'
import { TranslateModule } from '@ngx-translate/core'
import { PipesModule } from '../../pipes/pipes.module'
import { AirGapAngularCoreModule } from '@airgap/angular-core'
import { ComponentsModule } from 'src/app/components/components.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    AccountsListPageRoutingModule,
    TranslateModule,
    PipesModule,
    AirGapAngularCoreModule
  ],
  declarations: [AccountsListPage]
})
export class AccountsListPageModule {}
