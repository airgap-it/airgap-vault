import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { AboutPopoverComponent } from './about-popover/about-popover.component'
import { AddressRowComponent } from './address-row/address-row.component'
import { CurrentSecretComponent } from './current-secret/current-secret.component'
import { WalletItemComponent } from './wallet-item/wallet-item.component'
import { IdenticonComponent } from './identicon/identicon.component'
import { CurrencySymbolComponent } from './currency-symbol/currency-symbol.component'

@NgModule({
  declarations: [
    AboutPopoverComponent,
    AddressRowComponent,
    CurrencySymbolComponent,
    CurrentSecretComponent,
    IdenticonComponent,
    WalletItemComponent
  ],
  imports: [IonicModule, CommonModule, TranslateModule],
  exports: [
    AboutPopoverComponent,
    AddressRowComponent,
    CurrencySymbolComponent,
    CurrentSecretComponent,
    IdenticonComponent,
    WalletItemComponent
  ],
  entryComponents: [AboutPopoverComponent]
})
export class ComponentsModule {}
