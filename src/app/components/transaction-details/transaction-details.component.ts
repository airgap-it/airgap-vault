import { ClipboardService } from '@airgap/angular-core'
import { IAirGapTransaction } from '@airgap/coinlib-core'
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'

interface AddressDetail {
  address: string
  name?: string
}

@Component({
  selector: 'airgap-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss']
})
export class TransactionDetailsComponent implements OnChanges {
  @Input()
  public transaction: IAirGapTransaction | undefined

  @Input()
  public interactionData: string | undefined

  @Input()
  public hideNetwork: boolean = false

  public fromAddresses: AddressDetail[] = []
  public toAddresses: AddressDetail[] = []
  public labeled: [string, string][] = []
  public displayRawData: boolean = false
  public displayDetails: boolean = false
  public displayFromTo: boolean = true

  constructor(private readonly clipboardService: ClipboardService) {}

  public ngOnChanges(_changes: SimpleChanges): void {
    if (!this.transaction) {
      return
    }

    const names = this.transaction.extra?.names ?? {}
    this.fromAddresses = this.transaction.from.map((address: string) => ({ address, name: names[address] }))
    this.toAddresses = this.transaction.to.map((address: string) => ({ address, name: names[address] }))
    this.labeled = (this.transaction.extra?.labeled ? Object.entries(this.transaction.extra.labeled) : []) as [string, string][]
    this.displayFromTo = this.transaction.displayFromTo ?? true
    if (!this.displayFromTo) {
      this.displayDetails = true
    }
  }

  public get type(): string | undefined {
    return this.transaction?.transactionDetails?.parameters?.entrypoint ?? this.transaction?.extra?.type
  }

  public get destination(): string | undefined {
    const destination = this.transaction?.transactionDetails?.destination ?? this.transaction?.extra?.destination
    return destination && !this.transaction?.to.includes(destination) ? destination : undefined
  }

  public toggleRawData(): void {
    this.displayRawData = !this.displayRawData
  }

  public toggleDetails(): void {
    this.displayDetails = !this.displayDetails
  }

  public copyRawData(): void {
    if (this.transaction?.transactionDetails) {
      this.clipboardService.copyAndShowToast(JSON.stringify(this.transaction.transactionDetails))
    }
  }

  public copyDetails(): void {
    if (this.interactionData) {
      this.clipboardService.copyAndShowToast(JSON.stringify(this.interactionData))
    }
  }
}
