import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { TransactionSignedPage } from './transaction-signed'
import { ComponentsModule } from '../../components/components.module'
import { QRCodeModule } from 'angularx-qrcode'

@NgModule({
  declarations: [
    TransactionSignedPage
  ],
  imports: [
    ComponentsModule,
    QRCodeModule,
    IonicPageModule.forChild(TransactionSignedPage)
  ],
  entryComponents: [
    TransactionSignedPage
  ]
})

export class TransactionSignedPageModule {}
