import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { ExportBackupPageRoutingModule } from './export-backup-routing.module'

import { ExportBackupPage } from './export-backup.page'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ExportBackupPageRoutingModule],
  declarations: [ExportBackupPage]
})
export class ExportBackupPageModule {}
