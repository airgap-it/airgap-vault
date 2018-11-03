import { Component, NgZone } from '@angular/core'
import {
  IonicPage,
  NavController,
  NavParams,
  LoadingController
} from 'ionic-angular'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'

import * as Neon from '@cityofzion/neon-js'

@IonicPage()
@Component({
  selector: 'page-sign-message-request',
  templateUrl: 'sign-message-request.html'
})
export class SignMessageRequestPage {
  signed: string
  publickey: string
  message: string

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public secretProvider: SecretsProvider,
    public loadingCtrl: LoadingController,
    private ngZone: NgZone
  ) {
    let data = this.navParams.get('data')
    let base64 = data.substr('airgap-vault://message?data='.length)
    let { message, publickey } = JSON.parse(atob(base64))
    this.message = message
    this.publickey = publickey
  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create({
      content: 'Signing...'
    })

    loading.present()

    this.signMessage()
      .then(signature => {
        loading.dismiss()
        this.ngZone.run(() => {
          let json = {
            message: this.message,
            signature: signature,
            publickey: this.publickey
          }
          console.log(
            `airgap-wallet://message?data=${btoa(JSON.stringify(json))}`
          )
          this.signed = `airgap-wallet://message?data=${btoa(
            JSON.stringify(json)
          )}`
        })
      })
      .catch(console.error)
  }

  signMessage(): Promise<string> {
    let wallets = this.secretProvider.getWallets()
    if (!wallets) {
      return
    }

    const secret = this.secretProvider.findByPublicKey(wallets[0].publicKey)

    // we should handle this case here as well
    if (!secret) {
      console.warn('no secret found to this public key')
    }

    return this.secretProvider
      .retrieveEntropyForSecret(secret)
      .then(entropy => {
        console.log('have secret', entropy)

        const privateKeyWIF =
          'L2qkBc4ogTZERR4Watg4QoQq37w8fxrVZkYrPk7ZZSoRUZsr9yML'

        let signature = Neon.wallet.sign(this.message, privateKeyWIF)

        console.log('signature', signature)

        return signature
      })
  }
}
