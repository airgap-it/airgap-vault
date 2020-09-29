import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { IACMessageType } from 'airgap-coin-lib'
import { PeerService } from 'src/app/services/peer/peer.service'
import { MessageThresholds, ThresholdService } from 'src/app/services/threshold/threshold.service'

@Component({
  selector: 'airgap-threshold-message',
  templateUrl: './threshold-message.component.html',
  styleUrls: ['./threshold-message.component.scss']
})
export class ThresholdMessageComponent implements OnInit {
  public messageTypes: typeof IACMessageType = IACMessageType

  @Input() public messageThresholds: MessageThresholds

  @Output() public readonly valueChanged: EventEmitter<void> = new EventEmitter()

  constructor(private readonly thresholdService: ThresholdService, private readonly peerService: PeerService) {}

  ngOnInit() {}

  public async setToggle(property: number, event: CustomEvent): Promise<void> {
    const key: string = `global.message.${property}`
    const value: boolean = event.detail.checked
    const sig: {
      signature: string
      publicKey: string
    } = await this.peerService.sign([key, value].join(':'))

    await this.thresholdService.setThreshold(key, value, sig.publicKey, sig.signature)
    this.valueChanged.emit()
  }
}
