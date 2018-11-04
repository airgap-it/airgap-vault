import { Component, NgZone } from '@angular/core'
import {
  IonicPage,
  NavController,
  NavParams,
  LoadingController,
  AlertController
} from 'ionic-angular'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'

import * as Neon from '@cityofzion/neon-js'

enum NeoIdentity {
  StackOverflow = 'stackoverflow',
  Swisscom = 'swisscom',
  Magic = 'magic'
}

@IonicPage()
@Component({
  selector: 'page-sign-message-request',
  templateUrl: 'sign-message-request.html'
})
export class SignMessageRequestPage {
  signed: string
  message: string
  selectedKeys: NeoIdentity[]

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public secretProvider: SecretsProvider,
    public loadingCtrl: LoadingController,
    private ngZone: NgZone,
    private alertController: AlertController
  ) {
    let message = this.navParams.get('message')
    this.message = message
  }

  ionViewWillEnter() {
    this.showCheckboxAlert()
  }

  signMessage(): Promise<string[]> {
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
        let privateKeyWIFs = []

        if (this.selectedKeys.indexOf(NeoIdentity.StackOverflow) >= 0) {
          privateKeyWIFs.push(
            'L2qkBc4ogTZERR4Watg4QoQq37w8fxrVZkYrPk7ZZSoRUZsr9yML'
          )
        }
        if (this.selectedKeys.indexOf(NeoIdentity.Swisscom) >= 0) {
          privateKeyWIFs.push(
            'KysNqEuLb3wmZJ6PsxbA9Bh6ewTybEda4dEiN9X7X48dJPkLWZ5a'
          )
        }
        if (this.selectedKeys.indexOf(NeoIdentity.Magic) >= 0) {
          privateKeyWIFs.push(
            'L1HKLWratxFhX94XSn98JEULQYKGhRycf4nREe3Cs8EPQStF5u9E'
          )
        }

        if (privateKeyWIFs.length === 0) {
          return
        }

        let signatures = []
        privateKeyWIFs.forEach(privateKey => {
          signatures.push(Neon.wallet.sign(this.message, privateKey))
        })

        return signatures
      })
  }

  initSignMessage() {
    let loading = this.loadingCtrl.create({
      content: 'Signing...'
    })

    loading.present()

    this.signMessage()
      .then(signatures => {
        loading.dismiss()
        this.ngZone.run(() => {
          let publickeys = []

          if (this.selectedKeys.indexOf(NeoIdentity.StackOverflow) >= 0) {
            publickeys.push(
              '02963fc761eb7135c4593bfc6a0af96d8588b70d8f6ef3af8549181e57772181f5'
            )
          }
          if (this.selectedKeys.indexOf(NeoIdentity.Swisscom) >= 0) {
            publickeys.push(
              '03c663ba46afa8349f020eb9e8f9e1dc1c8e877b9d239e139af699049126e0f321'
            )
          }
          if (this.selectedKeys.indexOf(NeoIdentity.Magic) >= 0) {
            publickeys.push(
              '02c1a9b2d0580902a6c2d09a8febd0a7a13518a9a61d08183f09ff929b66ac7c26'
            )
          }

          if (publickeys.length === 0) {
            return
          }

          console.log('signatures', signatures)
          console.log('publickeys', publickeys)

          let json = {
            message: this.message,
            signature: signatures[0],
            publickey: publickeys[0]
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

  showCheckboxAlert() {
    let alert = this.alertController.create()
    alert.setTitle('NEO Identities')

    alert.addInput({
      type: 'checkbox',
      label: 'Stackoverflow',
      value: NeoIdentity.StackOverflow
    })

    alert.addInput({
      type: 'checkbox',
      label: 'Swisscom Employee',
      value: NeoIdentity.Swisscom
    })

    alert.addInput({
      type: 'checkbox',
      label: 'Magic The Gathering Expert',
      value: NeoIdentity.Magic
    })

    alert.addButton({
      text: 'Cancel',
      handler: () => {
        this.navCtrl.pop()
      }
    })

    alert.addButton({
      text: 'Okay',
      handler: (data: any) => {
        if (data.length === 0) {
          this.navCtrl.pop()
        } else {
          this.selectedKeys = data
          this.initSignMessage()
        }
      }
    })

    alert.present()
  }
}
