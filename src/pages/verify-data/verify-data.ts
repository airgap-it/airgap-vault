import { Component } from '@angular/core'
import { IonicPage, NavController, NavParams } from 'ionic-angular'
import { DeserializedSyncProtocol } from 'airgap-coin-lib'

@IonicPage()
@Component({
  selector: 'page-verify-data',
  templateUrl: 'verify-data.html'
})
export class VerifyDataPage {
  deserializedSync: DeserializedSyncProtocol

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.deserializedSync = this.navParams.get('deserializedSync')
    console.log(this.deserializedSync)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VerifyDataPage')
  }
}
