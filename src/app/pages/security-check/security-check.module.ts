import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { SecurityCheckPageRoutingModule } from './security-check-routing.module'

import { SecurityCheckPage } from './security-check.page'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SecurityCheckPageRoutingModule],
  declarations: [SecurityCheckPage]
})
export class SecurityCheckPageModule {}
