import { Component, Input } from '@angular/core'
import { DeserializedSyncProtocol, IAirGapTransaction, getProtocolByIdentifier, SignedTransaction } from 'airgap-coin-lib'
import { handleErrorSentry, ErrorCategory } from '../../providers/sentry-error-handler/sentry-error-handler'

@Component({
  selector: 'signed-transaction',
  templateUrl: 'signed-transaction.html'
})
export class SignedTransactionComponent {
  @Input()
  signedTx: DeserializedSyncProtocol

  airGapTx: IAirGapTransaction
  fallbackActivated: boolean = false

  rawTxData: SignedTransaction

  constructor() {
    //
  }

  async ngOnChanges() {
    if (this.signedTx) {
      const protocol = getProtocolByIdentifier(this.signedTx.protocol)
      try {
        this.airGapTx = await protocol.getTransactionDetailsFromSigned(this.signedTx.payload as SignedTransaction)
        this.fallbackActivated = false
      } catch (e) {
        this.fallbackActivated = true
        this.rawTxData = this.signedTx.payload as SignedTransaction
        handleErrorSentry(ErrorCategory.COINLIB)(e)
      }
    }
  }
}
