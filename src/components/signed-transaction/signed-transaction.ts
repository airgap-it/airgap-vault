import { Component, Input } from '@angular/core'
import {
  DeserializedSyncProtocol,
  IAirGapTransaction,
  getProtocolByIdentifier,
  UnsignedTransaction,
  SignedTransaction,
  SyncProtocolUtils
} from 'airgap-coin-lib'
import { deepCopy } from '../../helpers/deep-copy'

@Component({
  selector: 'signed-transaction',
  templateUrl: 'signed-transaction.html'
})
export class SignedTransactionComponent {
  public displayRawData: boolean = false
  public airGapTxCopy: IAirGapTransaction
  @Input()
  signedTx: DeserializedSyncProtocol

  @Input()
  unsignedTx: DeserializedSyncProtocol

  @Input()
  syncProtocolString: string

  airGapTx: IAirGapTransaction

  fallbackActivated: boolean = false

  rawTxData: string

  constructor() {
    //
  }

  public showRawData() {
    this.displayRawData = !this.displayRawData
    this.airGapTxCopy = deepCopy(this.airGapTx)
    const protocol = getProtocolByIdentifier(this.airGapTx.protocolIdentifier)
    this.airGapTxCopy.amount = this.airGapTxCopy.amount.shiftedBy(-1 * protocol.decimals)
    this.airGapTxCopy.fee = this.airGapTxCopy.fee.shiftedBy(-1 * protocol.feeDecimals)
  }

  async ngOnChanges() {
    if (this.syncProtocolString) {
      try {
        const syncUtils = new SyncProtocolUtils()
        const parts = this.syncProtocolString.split('?d=') // TODO: Use sync scheme handler to unpack
        this.signedTx = await syncUtils.deserialize(parts[parts.length - 1])
      } catch (err) {
        this.fallbackActivated = true
        this.rawTxData = this.syncProtocolString
      }
    }

    if (this.signedTx) {
      const protocol = getProtocolByIdentifier(this.signedTx.protocol)
      try {
        this.airGapTx = await protocol.getTransactionDetailsFromSigned(this.signedTx.payload as SignedTransaction)
        this.fallbackActivated = false
      } catch (e) {
        this.fallbackActivated = true
        this.rawTxData = (this.signedTx.payload as SignedTransaction).transaction
      }
    }

    if (this.unsignedTx) {
      const protocol = getProtocolByIdentifier(this.unsignedTx.protocol)
      try {
        this.airGapTx = await protocol.getTransactionDetails(this.unsignedTx.payload as UnsignedTransaction)
        this.fallbackActivated = false
      } catch (e) {
        this.fallbackActivated = true
        this.rawTxData = JSON.stringify((this.unsignedTx.payload as UnsignedTransaction).transaction)
      }
    }
  }
}
