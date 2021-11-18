import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { ErrorHistoryPageRoutingModule } from './error-history-routing.module'

import { ErrorHistoryPage } from './error-history.page'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ErrorHistoryPageRoutingModule],
  declarations: [ErrorHistoryPage]
})
export class ErrorHistoryPageModule {}
