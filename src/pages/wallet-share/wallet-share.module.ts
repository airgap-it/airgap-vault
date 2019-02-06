import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { WalletSharePage } from './wallet-share'
import { ComponentsModule } from '../../components/components.module'
import { QRCodeModule } from 'angularx-qrcode'
import { MaterialIconsModule } from 'ionic2-material-icons'
import { TranslateModule } from '@ngx-translate/core'
import { ShareUrlProvider } from '../../providers/share-url/share-url'

@NgModule({
  declarations: [WalletSharePage],
  imports: [ComponentsModule, QRCodeModule, MaterialIconsModule, IonicPageModule.forChild(WalletSharePage), TranslateModule],
  entryComponents: [WalletSharePage],
  providers: [ShareUrlProvider]
})
export class WalletSharePageModule {}
