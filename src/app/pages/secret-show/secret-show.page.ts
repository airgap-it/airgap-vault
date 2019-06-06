import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { AlertController, NavController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'

// import { SecretValidatePage } from '../secret-validate/secret-validate'
import { Secret } from '../../models/secret'

import { SHOW_SECRET_MIN_TIME_IN_SECONDS } from './../../constants/constants'
import { ErrorCategory, handleErrorLocal } from './../../services/error-handler/error-handler.service'

@Component({
  selector: 'secret-show',
  templateUrl: './secret-show.page.html',
  styleUrls: ['./secret-show.page.scss']
})
export class SecretShowPage {
  private readonly secret: Secret
  public startTime = new Date()

  constructor(
    public navController: NavController,
    private readonly alertController: AlertController,
    private readonly translateService: TranslateService,
    private readonly router: Router
  ) {
    this.secret = new Secret('90ac75896c3f57107c4ab0979b7c2ca1790e29ce7d25308b997fbbd53b9829c4', 'asdf') // TODO: Get secret from previous page

    // this.secret = this.navParams.get('secret')
  }

  public goToValidateSecret() {
    if (this.startTime.getTime() + SHOW_SECRET_MIN_TIME_IN_SECONDS * 1000 > new Date().getTime()) {
      this.translateService
        .get([
          'secret-show.too-fast_alert.title',
          'secret-show.too-fast_alert.heading',
          'secret-show.too-fast_alert.text',
          'secret-show.too-fast_alert.wait_label_p1',
          'secret-show.too-fast_alert.wait_label_p2'
        ])
        .subscribe(async values => {
          const title: string = values['secret-show.too-fast_alert.title']
          const heading: string = values['secret-show.too-fast_alert.heading']
          const text: string = values['secret-show.too-fast_alert.text']
          const wait_label_p1: string = values['secret-show.too-fast_alert.wait_label_p1']
          const wait_label_p2: string = values['secret-show.too-fast_alert.wait_label_p2']

          const alert = await this.alertController.create({
            header: title,
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
          alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
        })
    } else {
      this.router.navigate(['secret-validate']).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))

      // this.navController.push(SecretValidatePage, { secret: this.secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }
}
