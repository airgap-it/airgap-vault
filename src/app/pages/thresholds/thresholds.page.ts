import { Component, OnInit } from '@angular/core'
import { Thresholds, ThresholdService } from 'src/app/services/threshold/threshold.service'

@Component({
  selector: 'airgap-thresholds',
  templateUrl: './thresholds.page.html',
  styleUrls: ['./thresholds.page.scss']
})
export class ThresholdsPage implements OnInit {
  public thresholds: Thresholds | undefined

  constructor(private readonly thresholdService: ThresholdService) {}

  public async ngOnInit(): Promise<void> {
    await this.refresh()
  }

  public async refresh(): Promise<void> {
    this.thresholds = await this.thresholdService.getThresholds()
  }
}
