import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { TabSecretsPageRoutingModule } from './tab-secrets-routing.module'

import { TabSecretsPage } from './tab-secrets.page'
import { TranslateModule } from '@ngx-translate/core'
import { ComponentsModule } from 'src/app/components/components.module'

@NgModule({
  imports: [CommonModule, ComponentsModule, FormsModule, IonicModule, TabSecretsPageRoutingModule, TranslateModule],
  declarations: [TabSecretsPage]
})
export class TabSecretsPageModule {}
