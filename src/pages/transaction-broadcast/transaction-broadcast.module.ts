import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { TransactionBroadcastPage } from './transaction-broadcast'
import { TransactionSignedPageModule } from '../transaction-signed/transaction-signed.module'
import { ComponentsModule } from '../../components/components.module'
import { IonicStorageModule } from '@ionic/storage'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [TransactionBroadcastPage],
  imports: [
    ComponentsModule,
    TransactionSignedPageModule,
    IonicStorageModule,
    IonicPageModule.forChild(TransactionBroadcastPage),
    TranslateModule
  ],
  entryComponents: [TransactionBroadcastPage]
})
export class TransactionBroadcastPageModule {}
