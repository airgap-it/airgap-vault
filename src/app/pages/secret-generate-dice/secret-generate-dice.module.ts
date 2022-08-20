import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { SecretGenerateDicePageRoutingModule } from './secret-generate-dice-routing.module'

import { SecretGenerateDicePage } from './secret-generate-dice.page'
import { TranslateModule } from '@ngx-translate/core'
import { ComponentsModule } from 'src/app/components/components.module'

@NgModule({
  imports: [CommonModule, ComponentsModule, FormsModule, IonicModule, SecretGenerateDicePageRoutingModule, TranslateModule],
  declarations: [SecretGenerateDicePage]
})
export class SecretGenerateDicePageModule {}
