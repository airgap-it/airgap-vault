import { ProtocolService, SerializerService, sumAirGapTxValues } from '@airgap/angular-core'
import { Component, Input } from '@angular/core'
import { IAirGapTransaction, ICoinProtocol, MainProtocolSymbols, ProtocolSymbols, SignedTransaction } from '@airgap/coinlib-core'
import BigNumber from 'bignumber.js'
import { TokenService } from 'src/app/services/token/TokenService'
import { SecretsService } from 'src/app/services/secrets/secrets.service'
import { IACMessageDefinitionObjectV3 } from '@airgap/serializer'
import { TezosSaplingProtocol } from '@airgap/tezos'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { ContactsService } from 'src/app/services/contacts/contacts.service'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { AddType } from 'src/app/services/contacts/contacts.service'

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

  public addressesNotOnContactBook: string[] = []
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

  constructor(
    private readonly protocolService: ProtocolService,
    private readonly serializerService: SerializerService,
    private readonly tokenService: TokenService,
    private readonly secretsService: SecretsService,
    private readonly navigationService: NavigationService,
    private readonly contactsService: ContactsService
  ) {
    //
  }

  public async ngOnChanges(): Promise<void> {
    if (this.syncProtocolString) {
      try {
        this.signedTxs = await this.serializerService.deserialize(this.syncProtocolString)
      } catch (err) {
        console.log('ERROR', err)
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
                  knownViewingKeys: await this.secretsService.getKnownViewingKeys()
                })
              } else {
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

    this.checkAdressesNames()
  }

  public async checkAdressesNames() {
    // Check for addresses in contact book
    if (this.airGapTxs && this.airGapTxs.length > 0) {
      const isBookenabled = await this.contactsService.isBookEnabled()
      if (isBookenabled) {
        this.addressesNotOnContactBook = []
        for (let i = 0; i < this.airGapTxs.length; i++) {
          this.airGapTxs[i].extra = { names: {} }
          const transaction = this.airGapTxs[i]
          const toAddresses = transaction.to
          for (let j = 0; j < toAddresses.length; j++) {
            const toAddress = toAddresses[j]
            const hasContactBookAddress = await this.contactsService.isAddressInContacts(toAddress)
            if (!hasContactBookAddress) this.addressesNotOnContactBook.push(toAddress)
            else {
              const name = await this.contactsService.getContactName(toAddress)
              if (name) this.airGapTxs[i].extra.names[toAddress] = name
            }
          }
          const fromAddresses = transaction.from
          for (let j = 0; j < fromAddresses.length; j++) {
            const fromAddress = fromAddresses[j]
            const hasContactBookAddress = await this.contactsService.isAddressInContacts(fromAddress)
            if (!hasContactBookAddress && !this.addressesNotOnContactBook.includes(fromAddress))
              this.addressesNotOnContactBook.push(fromAddress)
            else {
              const name = await this.contactsService.getContactName(fromAddress)
              if (name) this.airGapTxs[i].extra.names[fromAddress] = name
            }
          }
        }
      }
    }
  }

  private async checkIfSaplingTransaction(transaction: SignedTransaction, protocolIdentifier: ProtocolSymbols): Promise<boolean> {
    if (protocolIdentifier === MainProtocolSymbols.XTZ) {
      try {
        const saplingProtocol: TezosSaplingProtocol = await this.getSaplingProtocol()
        const txDetails: IAirGapTransaction[] = await saplingProtocol.getTransactionDetailsFromSigned(transaction)
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

  private async getSaplingProtocol(): Promise<TezosSaplingProtocol> {
    return (await this.protocolService.getProtocol(MainProtocolSymbols.XTZ_SHIELDED)) as TezosSaplingProtocol
  }

  async onClickAddContact(address: string) {
    this.navigationService
      .routeWithState('/contact-book-contacts-detail', { isNew: true, address, addType: AddType.SIGNING })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  async onClickDontAddContact(address: string) {
    await this.contactsService.addSuggestion(address)
    const index = this.addressesNotOnContactBook.findIndex((address) => address === address)
    if (index >= 0) {
      this.addressesNotOnContactBook.splice(index, 1)
    }
  }

  async onClickDisableContact() {
    await this.contactsService.setBookEnable(false)
    this.addressesNotOnContactBook = []
  }
}
