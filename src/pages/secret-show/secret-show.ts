import { Component } from '@angular/core'
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular'
import { SecretValidatePage } from '../secret-validate/secret-validate'
import { Secret } from '../../models/secret'
import { SHOW_SECRET_MIN_TIME_IN_SECONDS } from '../../app/constants'

@IonicPage()
@Component({
  selector: 'page-secret-show',
  templateUrl: 'secret-show.html',
})

export class SecretShowPage {

  private secret: Secret
  startTime = new Date()

  constructor(public navController: NavController, private alertController: AlertController, private navParams: NavParams) {
    this.secret = this.navParams.get('secret')
  }

  goToValidateSecret() {
    if (this.startTime.getTime() + SHOW_SECRET_MIN_TIME_IN_SECONDS * 1000 > new Date().getTime()) {
      this.alertController.create({
        title: 'That was fast!',
        message: 'Are you sure you are not a super human?<br />Make sure that you followed all the rules and didn\'t do anything , else then writting your secret on paper.<br />Please wait until at least ' + SHOW_SECRET_MIN_TIME_IN_SECONDS + 's are over.',
        buttons: ['Okay']
      }).present()
    } else {
      this.navController.push(SecretValidatePage, { secret: this.secret })
    }
  }

}
