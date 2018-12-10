import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { WalletAddressPage } from './wallet-address'
import { ComponentsModule } from '../../components/components.module'
import { QRCodeModule } from 'angularx-qrcode'
import { MaterialIconsModule } from 'ionic2-material-icons'
import { WalletEditPopoverComponent } from './wallet-edit-popover/wallet-edit-popover.component'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [WalletAddressPage, WalletEditPopoverComponent],
  imports: [ComponentsModule, QRCodeModule, MaterialIconsModule, IonicPageModule.forChild(WalletAddressPage), TranslateModule],
  entryComponents: [WalletAddressPage, WalletEditPopoverComponent]
})
export class WalletAddressPageModule {}
