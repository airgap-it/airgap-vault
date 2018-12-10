import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { TransactionUnlockPage } from './transaction-unlock'
import { ComponentsModule } from '../../components/components.module'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [TransactionUnlockPage],
  imports: [ComponentsModule, IonicPageModule.forChild(TransactionUnlockPage), TranslateModule],
  entryComponents: [TransactionUnlockPage]
})
export class TransactionUnlockPageModule {}
