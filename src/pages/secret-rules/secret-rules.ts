import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { SecretShowPage } from '../secret-show/secret-show'
import { Secret } from '../../models/secret'

@IonicPage()
@Component({
  selector: 'page-secret-rules',
  templateUrl: 'secret-rules.html'
})
export class SecretRulesPage {
  private secret: Secret

  constructor(private navController: NavController, private navParams: NavParams) {
    this.secret = this.navParams.get('secret')
  }

  goToShowSecret() {
    this.navController.push(SecretShowPage, { secret: this.secret })
  }
}
