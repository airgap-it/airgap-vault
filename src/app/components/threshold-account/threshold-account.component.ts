import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core'
import { MainProtocolSymbols } from 'airgap-coin-lib/dist/utils/ProtocolSymbols'
import { AccountThreshold, SpendingThresholds } from 'src/app/services/threshold/threshold.service'

@Component({
  selector: 'airgap-threshold-account',
  templateUrl: './threshold-account.component.html',
  styleUrls: ['./threshold-account.component.scss']
})
export class ThresholdAccountComponent implements OnInit {
  public protocolTypes: typeof MainProtocolSymbols = MainProtocolSymbols
  public protocols: string[] = Object.values(MainProtocolSymbols)

  @Input() public accountThresholds: AccountThreshold<SpendingThresholds>

  public accountThresholdsArray: any = {}

  @Output() public readonly valueChanged: EventEmitter<void> = new EventEmitter()

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    this.protocols.forEach((protocol) => {
      this.accountThresholdsArray[protocol] = Object.entries(changes.accountThresholds.currentValue[protocol])
    })
  }
}
