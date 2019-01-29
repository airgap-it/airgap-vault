import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the SecretWalletInteractionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-secret-wallet-interaction',
  templateUrl: 'secret-wallet-interaction.html',
})
export class SecretWalletInteractionPage {

  private interactionSetting: string

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  onSelectedSettingChange(selectedSetting) {
    this.interactionSetting = selectedSetting
    console.log(this.interactionSetting)
  }

}
