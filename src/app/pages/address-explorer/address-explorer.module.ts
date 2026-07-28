import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { IonicModule } from '@ionic/angular'

import { AddressExplorerPageRoutingModule } from './address-explorer-routing.module'

import { AddressExplorerPage } from './address-explorer.page'
import { ComponentsModule } from '@airgap/angular-core'

@NgModule({
  imports: [CommonModule, ComponentsModule, FormsModule, IonicModule, TranslateModule, AddressExplorerPageRoutingModule],
  declarations: [AddressExplorerPage]
})
export class AddressExplorerPageModule {}
