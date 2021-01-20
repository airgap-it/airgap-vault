import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { AuditLogPageRoutingModule } from './audit-log-routing.module'

import { AuditLogPage } from './audit-log.page'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, AuditLogPageRoutingModule],
  declarations: [AuditLogPage]
})
export class AuditLogPageModule {}
