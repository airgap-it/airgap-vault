import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { SecretDetailPageRoutingModule } from './secret-detail-routing.module'

import { SecretDetailPage } from './secret-detail.page'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SecretDetailPageRoutingModule],
  declarations: [SecretDetailPage]
})
export class SecretDetailPageModule {}
