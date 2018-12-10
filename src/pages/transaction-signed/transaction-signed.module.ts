import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { TransactionSignedPage } from './transaction-signed'
import { ComponentsModule } from '../../components/components.module'
import { QRCodeModule } from 'angularx-qrcode'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [TransactionSignedPage],
  imports: [ComponentsModule, QRCodeModule, IonicPageModule.forChild(TransactionSignedPage), TranslateModule],
  entryComponents: [TransactionSignedPage]
})
export class TransactionSignedPageModule {}
