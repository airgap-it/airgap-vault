import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { PeerService } from 'src/app/services/peer/peer.service'
import { AppThresholds, ThresholdService } from 'src/app/services/threshold/threshold.service'

@Component({
  selector: 'airgap-threshold-app',
  templateUrl: './threshold-app.component.html',
  styleUrls: ['./threshold-app.component.scss']
})
export class ThresholdAppComponent implements OnInit {
  @Input() public appThresholds: AppThresholds

  @Output() public readonly valueChanged: EventEmitter<void> = new EventEmitter()

  constructor(private readonly thresholdService: ThresholdService, private readonly peerService: PeerService) {}

  ngOnInit() {}

  public async setToggle(property: string, event: CustomEvent): Promise<void> {
    const key: string = `global.app.${property}`
    const value: boolean = event.detail.checked
    const sig: {
      signature: string
      publicKey: string
    } = await this.peerService.sign([key, value].join(':'))

    await this.thresholdService.setThreshold(key, value, sig.publicKey, sig.signature)
    this.valueChanged.emit()
  }
}
