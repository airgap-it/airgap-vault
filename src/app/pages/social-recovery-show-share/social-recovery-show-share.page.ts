import { Component } from '@angular/core'
import { NavController, NavParams } from '@ionic/angular'

import { Secret } from '../../models/secret'

@Component({
  selector: 'app-social-recovery-show-share',
  templateUrl: './social-recovery-show-share.page.html',
  styleUrls: ['./social-recovery-show-share.page.scss']
})
export class SocialRecoveryShowSharePage {
  public secret: Secret
  public shares: string[]
  public currentShare: number

  constructor(private readonly navCtrl: NavController, navParams: NavParams) {
    // this.shares = navParams.get('shares')
    // this.secret = navParams.get('secret')
    // this.currentShare = navParams.get('currentShare')
  }

  public back() {
    // this.navCtrl.pop().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public next() {
    // this.navCtrl
    //   .push(SocialRecoveryValidateSharePage, { shares: this.shares, currentShare: this.currentShare, secret: this.secret })
    //   .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public finish() {
    // this.navCtrl.popToRoot().catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
