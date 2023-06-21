import { AirGapAngularCoreModule } from '@airgap/angular-core'
import { AirGapAngularNgRxModule } from '@airgap/angular-ngrx'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { QRCodeModule } from 'angularx-qrcode'

import { PipesModule } from '../pipes/pipes.module'

import { EntropyProgressComponent } from './entropy-progress/entropy-progress.component'
import { GridInputComponent } from './grid-input/grid-input.component'
import { KeyboardPopoverComponent } from './keyboard-popover/keyboard-popover.component'
import { MessageSignRequestComponent } from './message-sign-request/message-sign-request.component'
import { MessageSignResponseComponent } from './message-sign-response/message-sign-response.component'
import { ProgressFooterComponent } from './progress-footer/progress-footer.component'
import { SecretItemComponent } from './secret-item/secret-item.component'
import { SecretOptionItemComponent } from './secret-option-item/secret-option-item.component'
import { SignedTransactionComponent } from './signed-transaction/signed-transaction.component'
import { TouchEntropyComponent } from './touch-entropy/touch-entropy.component'
import { TraceInputDirective } from './trace-input/trace-input.directive'
import { TransactionWarningComponent } from './transaction-warning/transaction-warning.component'
import { TransactionComponent } from './transaction/transaction.component'
import { VerifyKeyAltComponent } from './verify-key-alt/verify-key-alt.component'
import { VerifyKeyComponent } from './verify-key/verify-key.component'
import { InteractionSelectionComponent } from './interaction-selection/interaction-selection.component'
import { MnemonicKeyboardComponent } from './mnemonic-keyboard/mnemonic-keyboard.component'
import { ProgressIndicatorComponent } from './progress-indicator/progress-indicator.component'

@NgModule({
  declarations: [
    EntropyProgressComponent,
    ProgressFooterComponent,
    SecretItemComponent,
    SignedTransactionComponent,
    TransactionComponent,
    TransactionWarningComponent,
    TouchEntropyComponent,
    TraceInputDirective,
    VerifyKeyComponent,
    VerifyKeyAltComponent,
    MessageSignRequestComponent,
    MessageSignResponseComponent,
    GridInputComponent,
    SecretOptionItemComponent,
    KeyboardPopoverComponent,
    InteractionSelectionComponent,
    MnemonicKeyboardComponent,
    ProgressIndicatorComponent
  ],
  imports: [
    IonicModule,
    PipesModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    QRCodeModule,
    AirGapAngularCoreModule,
    AirGapAngularNgRxModule
  ],
  exports: [
    EntropyProgressComponent,
    ProgressFooterComponent,
    SecretItemComponent,
    SignedTransactionComponent,
    TransactionComponent,
    TransactionWarningComponent,
    TouchEntropyComponent,
    TraceInputDirective,
    VerifyKeyComponent,
    VerifyKeyAltComponent,
    MessageSignRequestComponent,
    MessageSignResponseComponent,
    GridInputComponent,
    SecretOptionItemComponent,
    KeyboardPopoverComponent,
    InteractionSelectionComponent,
    MnemonicKeyboardComponent,
    ProgressIndicatorComponent
  ]
})
export class ComponentsModule {}
