import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { TransactionUnlockPage } from './transaction-unlock'
import { ComponentsModule } from '../../components/components.module'

@NgModule({
  declarations: [TransactionUnlockPage],
  imports: [ComponentsModule, IonicPageModule.forChild(TransactionUnlockPage)],
  entryComponents: [TransactionUnlockPage]
})
export class TransactionUnlockPageModule {}
