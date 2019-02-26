import { AboutPopoverComponent } from './about-popover/about-popover.component'
import { NgModule } from '@angular/core'
import { EntropyProgressComponent } from './entropy-progress/entropy-progress'
import { TouchEntropyComponent } from './touch-entropy/touch-entropy'
import { VerifyKeyComponent } from './verify-key/verify-key'
import { HexagonIconComponent } from './hexagon-icon/hexagon-icon'
import { IdenticonComponent } from './identicon/identicon'
import { AddressRowComponent } from './address-row/address-row'
import { FromToComponent } from './from-to/from-to'
import { CurrentSecretComponent } from './current-secret/current-secret'
import { IonTextAvatar } from './ion-text-avatar/ion-text-avatar'
import { IonicModule } from 'ionic-angular'
import { BrowserModule } from '@angular/platform-browser'
import { MaterialIconsModule } from 'ionic2-material-icons'
import { TraceInputDirective } from './trace-input/trace-input.directive'
import { ProgressFooterComponent } from './progress-footer/progress-footer'
import { WalletItemComponent } from './wallet-item/wallet-item'
import { FeeConverterPipe } from './pipes/fee-converter/fee-converter.pipe'
import { AmountConverterPipe } from './pipes/amount-converter/amount-converter.pipe'
import { TranslateModule } from '@ngx-translate/core'
import { SecretItemComponent } from './secret-item/secret-item'
import { SignedTransactionComponent } from './signed-transaction/signed-transaction';
import { QrClipboardComponent } from './qr-clipboard/qr-clipboard'
import { QRCodeModule } from 'angularx-qrcode'
import { CurrencySymbolComponent } from './currency-symbol/currency-symbol';

@NgModule({
  declarations: [
    EntropyProgressComponent,
    TouchEntropyComponent,
    VerifyKeyComponent,
    HexagonIconComponent,
    IdenticonComponent,
    AddressRowComponent,
    FromToComponent,
    WalletItemComponent,
    CurrentSecretComponent,
    ProgressFooterComponent,
    IonTextAvatar,
    TraceInputDirective,
    FeeConverterPipe,
    AmountConverterPipe,
    SecretItemComponent,
    AboutPopoverComponent,
    SignedTransactionComponent,
    QrClipboardComponent,
    CurrencySymbolComponent
  ],
  imports: [IonicModule, BrowserModule, TranslateModule, MaterialIconsModule, QRCodeModule],
  exports: [
    EntropyProgressComponent,
    TouchEntropyComponent,
    VerifyKeyComponent,
    HexagonIconComponent,
    IdenticonComponent,
    AddressRowComponent,
    FromToComponent,
    WalletItemComponent,
    CurrentSecretComponent,
    ProgressFooterComponent,
    IonTextAvatar,
    FeeConverterPipe,
    AmountConverterPipe,
    SecretItemComponent,
    AboutPopoverComponent,
    QrClipboardComponent,
    CurrencySymbolComponent
  ]
})
export class ComponentsModule { }
