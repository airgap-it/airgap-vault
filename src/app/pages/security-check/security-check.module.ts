import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { SecurityCheckPageRoutingModule } from './security-check-routing.module'

import { SecurityCheckPage } from './security-check.page'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SecurityCheckPageRoutingModule, TranslateModule],
  declarations: [SecurityCheckPage]
})
export class SecurityCheckPageModule {}
