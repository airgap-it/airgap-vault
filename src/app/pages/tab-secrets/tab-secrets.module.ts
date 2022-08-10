import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { TabSecretsPageRoutingModule } from './tab-secrets-routing.module'

import { TabSecretsPage } from './tab-secrets.page'
import { TranslateModule } from '@ngx-translate/core'
import { ComponentsModule } from 'src/app/components/components.module'
import { PipesModule } from 'src/app/pipes/pipes.module'
import { TabSecretPopoverComponent } from './tab-secret-popover/tab-secret-popover.component'

@NgModule({
  entryComponents: [TabSecretPopoverComponent],
  imports: [CommonModule, ComponentsModule, FormsModule, IonicModule, TabSecretsPageRoutingModule, TranslateModule, PipesModule],
  declarations: [TabSecretsPage, TabSecretPopoverComponent]
})
export class TabSecretsPageModule {}
