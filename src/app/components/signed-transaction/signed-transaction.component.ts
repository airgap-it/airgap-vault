import { Component, Input } from '@angular/core'
import {
  DeserializedSyncProtocol,
  getProtocolByIdentifier,
  IAirGapTransaction,
  SignedTransaction,
  SyncProtocolUtils,
  UnsignedTransaction
} from 'airgap-coin-lib'

import { ProtocolsService } from '../../services/protocols/protocols.service'

@Component({
  selector: 'airgap-signed-transaction',
  templateUrl: './signed-transaction.component.html',
  styleUrls: ['./signed-transaction.component.scss']
})
export class SignedTransactionComponent {
  @Input()
  public signedTx: DeserializedSyncProtocol

  @Input()
  public unsignedTx: DeserializedSyncProtocol

  @Input()
  public syncProtocolString: string

  public airGapTx: IAirGapTransaction
  public fallbackActivated: boolean = false

  public rawTxData: string

  constructor(private readonly protocolsService: ProtocolsService) {
    //
  }

  public async ngOnChanges() {
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
        // tslint:disable-next-line:no-unnecessary-type-assertion
        const signedTransaction: SignedTransaction = this.signedTx.payload as SignedTransaction
        this.airGapTx = (await protocol.getTransactionDetailsFromSigned(signedTransaction))[0]
        try {
          this.airGapTx = await this.protocolsService.getTokenTransferDetailsFromSigned(this.airGapTx, signedTransaction)
        } catch (error) {
          console.error('unable to parse token transaction, using ethereum transaction details instead')
        }

        this.fallbackActivated = false
      } catch (e) {
        this.fallbackActivated = true
        // tslint:disable-next-line:no-unnecessary-type-assertion
        this.rawTxData = (this.signedTx.payload as SignedTransaction).transaction
      }
    }

    if (this.unsignedTx) {
      const protocol = getProtocolByIdentifier(this.unsignedTx.protocol)
      try {
        // tslint:disable-next-line:no-unnecessary-type-assertion
        const unsignedTransaction: UnsignedTransaction = this.unsignedTx.payload as UnsignedTransaction
        this.airGapTx = (await protocol.getTransactionDetails(unsignedTransaction))[0]
        try {
          this.airGapTx = await this.protocolsService.getTokenTransferDetails(this.airGapTx, unsignedTransaction)
        } catch (error) {
          console.error('unable to parse token transaction, using ethereum transaction details instead')
        }

        this.fallbackActivated = false
      } catch (e) {
        this.fallbackActivated = true
        // tslint:disable-next-line:no-unnecessary-type-assertion
        this.rawTxData = JSON.stringify((this.unsignedTx.payload as UnsignedTransaction).transaction)
      }
    }
  }
}
