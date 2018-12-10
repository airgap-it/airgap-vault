import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { TransactionDetailPage } from './transaction-detail'
import { ComponentsModule } from '../../components/components.module'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [TransactionDetailPage],
  imports: [ComponentsModule, IonicPageModule.forChild(TransactionDetailPage), TranslateModule],
  entryComponents: [TransactionDetailPage],
  providers: []
})
export class TransactionDetailPageModule {}
