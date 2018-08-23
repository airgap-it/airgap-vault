import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { SocialRecoveryValidateSharePage } from '../social-recovery-validate-share/social-recovery-validate-share'
import { Secret } from '../../models/secret'

/**
 * Generated class for the SocialRecoveryShowSharePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-social-recovery-show-share',
  templateUrl: 'social-recovery-show-share.html'
})
export class SocialRecoveryShowSharePage {

  secret: Secret
  shares: string[]
  currentShare: number

  constructor(private navCtrl: NavController, navParams: NavParams) {
    this.shares = navParams.get('shares')
    this.secret = navParams.get('secret')
    this.currentShare = navParams.get('currentShare')
  }

  back() {
    this.navCtrl.pop()
  }

  next() {
    this.navCtrl.push(SocialRecoveryValidateSharePage, { shares: this.shares, currentShare: this.currentShare, secret: this.secret })
  }

  finish() {
    this.navCtrl.popToRoot()
  }

}
