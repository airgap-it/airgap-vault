import { Component } from '@angular/core'

@Component({
  selector: 'airgap-social-recovery-generate-intro',
  templateUrl: './social-recovery-generate-intro.page.html',
  styleUrls: ['./social-recovery-generate-intro.page.scss']
})
export class SocialRecoveryGenerateIntroPage {
  public state: 0 | 1 | 2 = 0
  constructor() {}

  nextState() {
    console.log('state', this.state)
    this.state++
  }
}
