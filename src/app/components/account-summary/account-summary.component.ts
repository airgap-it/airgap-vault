import { AirGapWallet } from '@airgap/coinlib-core'
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core'

@Component({
  selector: 'airgap-account-summary',
  templateUrl: './account-summary.component.html',
  styleUrls: ['./account-summary.component.scss']
})
export class AccountSummaryComponent implements OnChanges {
  @Input()
  public wallet: AirGapWallet | undefined

  @Input()
  public label: string | undefined

  @Input()
  public selectable: boolean = false

  @Output()
  public readonly selected: EventEmitter<AirGapWallet> = new EventEmitter<AirGapWallet>()

  public protocolName: string | undefined
  public protocolSymbol: string | undefined
  public protocolIdentifier: string | undefined

  public async ngOnChanges(_changes: SimpleChanges): Promise<void> {
    if (!this.wallet) {
      return
    }

    const [protocolName, protocolSymbol, protocolIdentifier] = await Promise.all([
      this.wallet.protocol.getName(),
      this.wallet.protocol.getSymbol(),
      this.wallet.protocol.getIdentifier()
    ])

    this.protocolName = protocolName
    this.protocolSymbol = protocolSymbol
    this.protocolIdentifier = protocolIdentifier
  }

  public select(): void {
    if (this.selectable && this.wallet) {
      this.selected.emit(this.wallet)
    }
  }

  public get accessibleLabel(): string {
    return [this.protocolName, this.protocolSymbol, this.label, this.wallet?.receivingPublicAddress].filter(Boolean).join(', ')
  }
}
