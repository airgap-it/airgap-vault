import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { TransactionBroadcastSelectionPage } from './transaction-broadcast-selection'
import { TransactionSignedPageModule } from '../transaction-signed/transaction-signed.module'
import { ComponentsModule } from '../../components/components.module'
import { IonicStorageModule } from '@ionic/storage'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [TransactionBroadcastSelectionPage],
  imports: [
    ComponentsModule,
    TransactionSignedPageModule,
    IonicStorageModule,
    IonicPageModule.forChild(TransactionBroadcastSelectionPage),
    TranslateModule
  ],
  entryComponents: [TransactionBroadcastSelectionPage]
})
export class TransactionBroadcastSelectionPageModule {}
