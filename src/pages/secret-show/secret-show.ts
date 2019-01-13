import { Component } from '@angular/core'
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular'
import { SecretValidatePage } from '../secret-validate/secret-validate'
import { Secret } from '../../models/secret'
import { SHOW_SECRET_MIN_TIME_IN_SECONDS } from '../../app/constants'
import { TranslateService } from '@ngx-translate/core'

@IonicPage()
@Component({
  selector: 'page-secret-show',
  templateUrl: 'secret-show.html'
})
export class SecretShowPage {
  private secret: Secret
  private startTime = new Date()

  public isRecover: boolean

  constructor(
    public navController: NavController,
    private alertController: AlertController,
    private navParams: NavParams,
    private translateService: TranslateService
  ) {
    this.secret = this.navParams.get('secret')
    this.isRecover = this.navParams.get('isRecover') || false
  }

  goToValidateSecret() {
    if (this.startTime.getTime() + SHOW_SECRET_MIN_TIME_IN_SECONDS * 1000 > new Date().getTime()) {
      this.translateService
        .get([
          'secret-show.too-fast_alert.title',
          'secret-show.too-fast_alert.heading',
          'secret-show.too-fast_alert.text',
          'secret-show.too-fast_alert.wait_label_p1',
          'secret-show.too-fast_alert.wait_label_p2'
        ])
        .subscribe(values => {
          let title = values['secret-show.too-fast_alert.title']
          let heading = values['secret-show.too-fast_alert.heading']
          let text = values['secret-show.too-fast_alert.text']
          let wait_label_p1 = values['secret-show.too-fast_alert.wait_label_p1']
          let wait_label_p2 = values['secret-show.too-fast_alert.wait_label_p2']

          this.alertController
            .create({
              title: title,
              message:
                heading +
                '<br/>' +
                text +
                '<br/>' +
                wait_label_p1 +
                '<strong>' +
                SHOW_SECRET_MIN_TIME_IN_SECONDS +
                wait_label_p2 +
                '</strong>',
              buttons: ['Okay']
            })
            .present()
        })
    } else {
      this.navController.push(SecretValidatePage, { secret: this.secret })
    }
  }

  done() {
    this.navController.pop()
  }
}
