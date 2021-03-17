import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { Bip85ValidatePageRoutingModule } from './bip85-validate-routing.module'

import { Bip85ValidatePage } from './bip85-validate.page'
import { TranslateModule } from '@ngx-translate/core'
import { ComponentsModule } from 'src/app/components/components.module'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, Bip85ValidatePageRoutingModule, TranslateModule, ComponentsModule],
  declarations: [Bip85ValidatePage]
})
export class Bip85ValidatePageModule {}
