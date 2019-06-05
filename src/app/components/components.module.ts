import { IonTextAvatar } from './ion-text-avatar/ion-text-avatar'
import { TraceInputDirective } from './trace-input/trace-input.directive'
import { QrClipboardComponent } from './qr-clipboard/qr-clipboard.component'
import { HexagonIconComponent } from './hexagon-icon/hexagon-icon.component'
import { SignedTransactionComponent } from './signed-transaction/signed-transaction.component'
import { ProgressFooterComponent } from './progress-footer/progress-footer.component'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { AboutPopoverComponent } from './about-popover/about-popover.component'
import { AddressRowComponent } from './address-row/address-row.component'
import { CurrencySymbolComponent } from './currency-symbol/currency-symbol.component'
import { CurrentSecretComponent } from './current-secret/current-secret.component'
import { IdenticonComponent } from './identicon/identicon.component'
import { SecretItemComponent } from './secret-item/secret-item.component'
import { AccountItemComponent } from './account-item/account-item.component'
import { EntropyProgressComponent } from './entropy-progress/entropy-progress.component'
import { FromToComponent } from './from-to/from-to.component'
import { TouchEntropyComponent } from './touch-entropy/touch-entropy.component'
import { VerifyKeyComponent } from './verify-key/verify-key.component'

@NgModule({
  declarations: [
    AboutPopoverComponent,
    AddressRowComponent,
    CurrencySymbolComponent,
    CurrentSecretComponent,
    EntropyProgressComponent,
    FromToComponent,
    HexagonIconComponent,
    IdenticonComponent,
    IonTextAvatar,
    ProgressFooterComponent,
    QrClipboardComponent,
    SecretItemComponent,
    SignedTransactionComponent,
    TouchEntropyComponent,
    TraceInputDirective,
    VerifyKeyComponent,
    AccountItemComponent
  ],
  imports: [IonicModule, CommonModule, FormsModule, TranslateModule],
  exports: [
    AboutPopoverComponent,
    AddressRowComponent,
    CurrencySymbolComponent,
    CurrentSecretComponent,
    EntropyProgressComponent,
    FromToComponent,
    HexagonIconComponent,
    IdenticonComponent,
    IonTextAvatar,
    ProgressFooterComponent,
    QrClipboardComponent,
    SecretItemComponent,
    SignedTransactionComponent,
    TouchEntropyComponent,
    TraceInputDirective,
    VerifyKeyComponent,
    AccountItemComponent
  ],
  entryComponents: [AboutPopoverComponent]
})
export class ComponentsModule {}
