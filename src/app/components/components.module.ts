import { AirGapAngularCoreModule } from '@airgap/angular-core'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { QRCodeModule } from 'angularx-qrcode'

import { PipesModule } from '../pipes/pipes.module'

import { AccountItemComponent } from './account-item/account-item.component'
import { CurrentSecretComponent } from './current-secret/current-secret.component'
import { EntropyProgressComponent } from './entropy-progress/entropy-progress.component'
import { ProgressFooterComponent } from './progress-footer/progress-footer.component'
import { SecretItemComponent } from './secret-item/secret-item.component'
import { SignedTransactionComponent } from './signed-transaction/signed-transaction.component'
import { TouchEntropyComponent } from './touch-entropy/touch-entropy.component'
import { TraceInputDirective } from './trace-input/trace-input.directive'
import { VerifyKeyComponent } from './verify-key/verify-key.component'

@NgModule({
  declarations: [
    CurrentSecretComponent,
    EntropyProgressComponent,
    ProgressFooterComponent,
    SecretItemComponent,
    SignedTransactionComponent,
    TouchEntropyComponent,
    TraceInputDirective,
    VerifyKeyComponent,
    AccountItemComponent
  ],
  imports: [IonicModule, PipesModule, CommonModule, FormsModule, TranslateModule, QRCodeModule, AirGapAngularCoreModule],
  exports: [
    CurrentSecretComponent,
    EntropyProgressComponent,
    ProgressFooterComponent,
    SecretItemComponent,
    SignedTransactionComponent,
    TouchEntropyComponent,
    TraceInputDirective,
    VerifyKeyComponent,
    AccountItemComponent
  ],
  entryComponents: []
})
export class ComponentsModule {}
