import { Component } from '@angular/core'
import { AlertController, IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { AirGapWallet, ICoinProtocol, supportedProtocols } from 'airgap-coin-lib'
import bip39 from 'bip39'

/**
 * Generated class for the WalletSelectCoinsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-wallet-select-coins',
  templateUrl: 'wallet-select-coins.html'
})
export class WalletSelectCoinsPage {

  selectedProtocol: ICoinProtocol
  customDerivationPath: string
  coinProtocols: ICoinProtocol[]
  isHDWallet: boolean = false

  constructor(public loadingCtrl: LoadingController, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private secretsProvider: SecretsProvider) {
    this.coinProtocols = supportedProtocols()
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WalletSelectCoinsPage')
  }

  onSelectedProtocolChange(selectedProtocol) {
    this.selectedProtocol = selectedProtocol
    this.isHDWallet = this.selectedProtocol.supportsHD
    this.customDerivationPath = this.selectedProtocol.standardDerivationPath
  }

  onIsHDWalletChange(isHDWallet) {
    this.isHDWallet = isHDWallet
    if (isHDWallet) {
      this.customDerivationPath = this.selectedProtocol.standardDerivationPath
    } else {
      this.customDerivationPath = this.selectedProtocol.standardDerivationPath + '/0/1'
    }
  }

  addWallet() {
    const loading = this.loadingCtrl.create({
      content: 'Deriving your wallet...'
    })
    loading.present()
    let secret = this.secretsProvider.getActiveSecret()
    this.secretsProvider.retrieveEntropyForSecret(secret).then(entropy => {
      let seed = bip39.mnemonicToSeedHex(bip39.entropyToMnemonic(entropy))
      let wallet = new AirGapWallet(this.selectedProtocol.identifier, this.selectedProtocol.getPublicKeyFromHexSecret(seed, this.customDerivationPath), this.isHDWallet, this.customDerivationPath)
      wallet.addresses = wallet.deriveAddresses(1)
      if (secret.wallets.find(obj => (obj.publicKey === wallet.publicKey) && (obj.protocolIdentifier === wallet.protocolIdentifier)) === undefined) {
        secret.wallets.push(wallet)
        this.secretsProvider.addOrUpdateSecret(secret).then(() => {
          this.navCtrl.popToRoot()
        })
      } else {
        let alert = this.alertCtrl.create({
          title: 'Wallet already exists',
          message: 'You already have added this specific wallet. Please change its derivation path to add another address (advanced mode).',
          enableBackdropDismiss: false,
          buttons: [
            {
              text: 'Okay!',
              role: 'cancel'
            }
          ]
        })
        alert.present()
      }
      loading.dismiss()
    }).catch(err => {
      console.error(err)
      loading.dismiss()
    })
  }
}
