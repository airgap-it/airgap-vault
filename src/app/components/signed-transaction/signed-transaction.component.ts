import { ICoinProtocolAdapter, ProtocolService, SerializerService, sumAirGapTxValues } from '@airgap/angular-core'
import { Component, Input } from '@angular/core'
import { IAirGapTransaction, ICoinProtocol, MainProtocolSymbols, ProtocolSymbols, SignedTransaction } from '@airgap/coinlib-core'
import BigNumber from 'bignumber.js'
import { TokenService } from 'src/app/services/token/TokenService'
import { SecretsService } from 'src/app/services/secrets/secrets.service'
import { IACMessageDefinitionObjectV3 } from '@airgap/serializer'
import { TezosSaplingProtocol } from '@airgap/tezos'

@Component({
  selector: 'airgap-signed-transaction',
  templateUrl: './signed-transaction.component.html',
  styleUrls: ['./signed-transaction.component.scss']
})
export class SignedTransactionComponent {
  @Input()
  public signedTxs: IACMessageDefinitionObjectV3[] | undefined // TODO: Type

  @Input()
  public syncProtocolString: string

  public airGapTxs: IAirGapTransaction[]
  public fallbackActivated: boolean = false
  public rawTxData: string
  public aggregatedInfo:
    | {
        numberOfTxs: number
        totalAmount: BigNumber
        totalFees: BigNumber
      }
    | undefined
  public interactionData: string

  constructor(
    private readonly protocolService: ProtocolService,
    private readonly serializerService: SerializerService,
    private readonly tokenService: TokenService,
    private readonly secretsService: SecretsService
  ) {
    //
  }

  public async ngOnChanges(): Promise<void> {
    if (this.syncProtocolString) {
      try {
        this.signedTxs = await this.serializerService.deserialize(this.syncProtocolString)
      } catch (err) {
        console.error(err)
        this.fallbackActivated = true
        this.rawTxData = this.syncProtocolString
      }
    }

    if (this.signedTxs) {
      const protocol: ICoinProtocol = await this.protocolService.getProtocol(this.signedTxs[0].protocol, undefined, false)
      try {
        // tslint:disable-next-line:no-unnecessary-type-assertion
        this.airGapTxs = (
          await Promise.all(
            this.signedTxs.map(async (signedTx) => {
              const payload: SignedTransaction = signedTx.payload as SignedTransaction
              if (await this.checkIfSaplingTransaction(payload, signedTx.protocol)) {
                const saplingProtocol = await this.getSaplingProtocol()
                return saplingProtocol.getTransactionDetailsFromSigned(payload, {
                  knownViewingKeys: await this.secretsService.getKnownViewingKeys(),
                  transactionOwner: signedTx.protocol
                })
              } else {
                if (signedTx.protocol === MainProtocolSymbols.STELLAR) {
                  this.interactionData = payload.transaction
                }
                return protocol.getTransactionDetailsFromSigned(payload)
              }
            })
          )
        ).reduce((flatten, toFlatten) => flatten.concat(toFlatten))
        if (
          this.airGapTxs.length > 1 &&
          this.airGapTxs.every((tx: IAirGapTransaction) => tx.protocolIdentifier === this.airGapTxs[0].protocolIdentifier)
        ) {
          this.aggregatedInfo = {
            numberOfTxs: this.airGapTxs.length,
            totalAmount: new BigNumber(sumAirGapTxValues(this.airGapTxs, 'amount')),
            totalFees: new BigNumber(sumAirGapTxValues(this.airGapTxs, 'fee'))
          }
        }
        try {
          if (this.airGapTxs.length !== 1) {
            throw Error('TokenTransferDetails returned more than 1 transaction!')
          }
          this.airGapTxs = [
            await this.tokenService.getTokenTransferDetailsFromSigned(this.airGapTxs[0], this.signedTxs[0].payload as SignedTransaction)
          ]
        } catch (error) {
          console.error('unable to parse token transaction, using ethereum transaction details instead')
        }

        this.fallbackActivated = false
      } catch (e) {
        this.fallbackActivated = true
        // tslint:disable-next-line:no-unnecessary-type-assertion
        this.rawTxData = (this.signedTxs[0].payload as SignedTransaction).transaction
      }
    }
  }

  private async checkIfSaplingTransaction(transaction: SignedTransaction, protocolIdentifier: ProtocolSymbols): Promise<boolean> {
    if (protocolIdentifier === MainProtocolSymbols.XTZ) {
      try {
        const saplingAdapter: ICoinProtocolAdapter<TezosSaplingProtocol> = await this.getSaplingProtocol()
        const txDetails: IAirGapTransaction[] = await saplingAdapter.getTransactionDetailsFromSigned(transaction, {
          transactionOwner: protocolIdentifier
        })
        const recipients: string[] = txDetails
          .map((details) => details.to)
          .reduce((flatten: string[], next: string[]) => flatten.concat(next), [])

        // TODO: find better way to check if `transaction` is a Sapling transaction
        return recipients.some((recipient: string) => recipient.startsWith('zet') || recipient.toLocaleLowerCase() === 'shielded pool')
      } catch (error) {
        console.error(error)
        return false
      }
    }

    return protocolIdentifier === MainProtocolSymbols.XTZ_SHIELDED
  }

  private async getSaplingProtocol(): Promise<ICoinProtocolAdapter<TezosSaplingProtocol>> {
    const protocol: ICoinProtocol = await this.protocolService.getProtocol(MainProtocolSymbols.XTZ_SHIELDED)
    if (!(protocol instanceof ICoinProtocolAdapter)) {
      throw new Error('Unexpected Sapling protocol implementation')
    }

    return protocol as ICoinProtocolAdapter<TezosSaplingProtocol>
  }
}
