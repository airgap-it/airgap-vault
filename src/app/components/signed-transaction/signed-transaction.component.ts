import { Component, Input, OnChanges } from '@angular/core'
import {
  getProtocolByIdentifier,
  IACMessageDefinitionObject,
  IAirGapTransaction,
  ICoinProtocol,
  SignedTransaction,
  UnsignedTransaction
} from 'airgap-coin-lib'
import BigNumber from 'bignumber.js'

import { ProtocolsService } from '../../services/protocols/protocols.service'
import { SerializerService } from '../../services/serializer/serializer.service'

@Component({
  selector: 'airgap-signed-transaction',
  templateUrl: './signed-transaction.component.html',
  styleUrls: ['./signed-transaction.component.scss']
})
export class SignedTransactionComponent implements OnChanges {
  @Input()
  public signedTxs: IACMessageDefinitionObject | undefined // TODO: Type

  @Input()
  public unsignedTxs: IACMessageDefinitionObject[] | undefined // TODO: Type

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

  constructor(private readonly protocolsService: ProtocolsService, private readonly serializerService: SerializerService) {
    //
  }

  public async ngOnChanges(): Promise<void> {
    if (this.syncProtocolString) {
      try {
        this.signedTxs = await this.serializerService.deserialize(this.syncProtocolString)[0]
      } catch (err) {
        console.log('ERROR', err)
        this.fallbackActivated = true
        this.rawTxData = this.syncProtocolString
      }
    }

    if (this.signedTxs) {
      const protocol: ICoinProtocol = getProtocolByIdentifier(this.signedTxs.protocol)
      try {
        // tslint:disable-next-line:no-unnecessary-type-assertion
        const signedTransaction: SignedTransaction = this.signedTxs.payload as SignedTransaction
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
        this.rawTxData = (this.signedTxs.payload as SignedTransaction).transaction
      }
    }

    if (this.unsignedTxs && this.unsignedTxs.length > 0) {
      const protocol: ICoinProtocol = getProtocolByIdentifier(this.unsignedTxs[0].protocol)
      try {
        // tslint:disable-next-line:no-unnecessary-type-assertion
        const unsignedTransaction: UnsignedTransaction = this.unsignedTxs[0].payload as UnsignedTransaction
        this.airGapTxs = await protocol.getTransactionDetails(unsignedTransaction)
        console.log(this.airGapTxs)
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
        this.rawTxData = JSON.stringify((this.unsignedTxs[0].payload as UnsignedTransaction).transaction)
      }
    }
  }
}
