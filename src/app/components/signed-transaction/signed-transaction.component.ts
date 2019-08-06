import { Component, Input, OnChanges, OnInit } from '@angular/core'
import {
  DeserializedSyncProtocol,
  getProtocolByIdentifier,
  IAirGapTransaction,
  ICoinProtocol,
  SignedTransaction,
  SyncProtocolUtils,
  UnsignedTransaction
} from 'airgap-coin-lib'
import BigNumber from 'bignumber.js'

import { ProtocolsService } from '../../services/protocols/protocols.service'

@Component({
  selector: 'airgap-signed-transaction',
  templateUrl: './signed-transaction.component.html',
  styleUrls: ['./signed-transaction.component.scss']
})
export class SignedTransactionComponent implements OnChanges {
  @Input()
  public signedTx: DeserializedSyncProtocol

  @Input()
  public unsignedTx: DeserializedSyncProtocol

  @Input()
  public syncProtocolString: string

  public airGapTxs: IAirGapTransaction[]
  public fallbackActivated: boolean = false

  public aggregatedInfo:
    | {
        numberOfTxs: number
        totalAmount: BigNumber
        totalFees: BigNumber
      }
    | undefined

  public rawTxData: string

  constructor(private readonly protocolsService: ProtocolsService) {
    //
  }

  public async ngOnChanges(): Promise<void> {
    if (this.syncProtocolString) {
      try {
        const syncUtils: SyncProtocolUtils = new SyncProtocolUtils()
        const parts: string[] = this.syncProtocolString.split('?d=') // TODO: Use sync scheme handler to unpack
        this.signedTx = await syncUtils.deserialize(parts[parts.length - 1])
      } catch (err) {
        this.fallbackActivated = true
        this.rawTxData = this.syncProtocolString
      }
    }

    if (this.signedTx) {
      const protocol: ICoinProtocol = getProtocolByIdentifier(this.signedTx.protocol)
      try {
        // tslint:disable-next-line:no-unnecessary-type-assertion
        const signedTransaction: SignedTransaction = this.signedTx.payload as SignedTransaction
        this.airGapTxs = await protocol.getTransactionDetailsFromSigned(signedTransaction)
        if (
          this.airGapTxs.length > 1 &&
          this.airGapTxs.every((tx: IAirGapTransaction) => tx.protocolIdentifier === this.airGapTxs[0].protocolIdentifier)
        ) {
          this.aggregatedInfo = {
            numberOfTxs: this.airGapTxs.length,
            totalAmount: this.airGapTxs.reduce((pv: BigNumber, cv: IAirGapTransaction) => pv.plus(cv.amount), new BigNumber(0)),
            totalFees: this.airGapTxs.reduce((pv: BigNumber, cv: IAirGapTransaction) => pv.plus(cv.fee), new BigNumber(0))
          }
        }
        try {
          if (this.airGapTxs.length !== 1) {
            throw Error('TokenTransferDetails returned more than 1 transaction!')
          }
          this.airGapTxs = [await this.protocolsService.getTokenTransferDetailsFromSigned(this.airGapTxs[0], signedTransaction)]
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
      const protocol: ICoinProtocol = getProtocolByIdentifier(this.unsignedTx.protocol)
      try {
        // tslint:disable-next-line:no-unnecessary-type-assertion
        const unsignedTransaction: UnsignedTransaction = this.unsignedTx.payload as UnsignedTransaction
        this.airGapTxs = await protocol.getTransactionDetails(unsignedTransaction)
        if (
          this.airGapTxs.length > 1 &&
          this.airGapTxs.every((tx: IAirGapTransaction) => tx.protocolIdentifier === this.airGapTxs[0].protocolIdentifier)
        ) {
          this.aggregatedInfo = {
            numberOfTxs: this.airGapTxs.length,
            totalAmount: this.airGapTxs.reduce((pv: BigNumber, cv: IAirGapTransaction) => pv.plus(cv.amount), new BigNumber(0)),
            totalFees: this.airGapTxs.reduce((pv: BigNumber, cv: IAirGapTransaction) => pv.plus(cv.fee), new BigNumber(0))
          }
        }

        try {
          if (this.airGapTxs.length !== 1) {
            throw Error('TokenTransferDetails returned more than 1 transaction!')
          }
          this.airGapTxs = [await this.protocolsService.getTokenTransferDetails(this.airGapTxs[0], unsignedTransaction)]
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
