import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { AuditLogDetailPageRoutingModule } from './audit-log-detail-routing.module'

import { AuditLogDetailPage } from './audit-log-detail.page'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, AuditLogDetailPageRoutingModule],
  declarations: [AuditLogDetailPage]
})
export class AuditLogDetailPageModule {}
