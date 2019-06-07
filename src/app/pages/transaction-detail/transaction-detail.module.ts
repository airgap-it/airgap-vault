import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { ComponentsModule } from '../../components/components.module'

import { TransactionDetailPage } from './transaction-detail.page'

const routes: Routes = [
  {
    path: '',
    component: TransactionDetailPage
  }
]

@NgModule({
  imports: [CommonModule, ComponentsModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [TransactionDetailPage]
})
export class TransactionDetailPageModule {}
