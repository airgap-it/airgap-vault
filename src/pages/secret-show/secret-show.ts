import { Component } from '@angular/core'
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular'
import { SecretValidatePage } from '../secret-validate/secret-validate'
import { Secret } from '../../models/secret'
import { SHOW_SECRET_MIN_TIME_IN_SECONDS } from '../../app/constants'
import { TranslateService } from '@ngx-translate/core'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'

@IonicPage()
@Component({
  selector: 'page-secret-show',
  templateUrl: 'secret-show.html'
})
export class SecretShowPage {
  private secret: Secret
  startTime = new Date()

  constructor(
    public navController: NavController,
    private alertController: AlertController,
    private navParams: NavParams,
    private translateService: TranslateService
  ) {
    this.secret = this.navParams.get('secret')
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
          let title: string = values['secret-show.too-fast_alert.title']
          let heading: string = values['secret-show.too-fast_alert.heading']
          let text: string = values['secret-show.too-fast_alert.text']
          let wait_label_p1: string = values['secret-show.too-fast_alert.wait_label_p1']
          let wait_label_p2: string = values['secret-show.too-fast_alert.wait_label_p2']

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
                SHOW_SECRET_MIN_TIME_IN_SECONDS.toString() +
                wait_label_p2 +
                '</strong>',
              buttons: ['Okay']
            })
            .present()
            .catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
        })
    } else {
      this.navController.push(SecretValidatePage, { secret: this.secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }
}
