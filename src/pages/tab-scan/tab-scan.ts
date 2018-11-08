import { Component, RendererFactory2 } from '@angular/core'
import { AlertController, IonicPage, NavController, Platform } from 'ionic-angular'
import { Transaction } from '../../models/transaction.model'
import { ScannerProvider } from '../../providers/scanner/scanner'
import { TransactionsProvider } from '../../providers/transactions/transactions'
import { AndroidPermissions } from '@ionic-native/android-permissions'
import { AirGapSchemeProvider } from '../../providers/scheme/scheme.service'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { SchemeRoutingProvider } from '../../providers/scheme-routing/scheme-routing'

@IonicPage()
@Component({
  selector: 'page-tab-scan',
  templateUrl: 'tab-scan.html'
})
export class TabScanPage {

  private renderer

  constructor(private schemeService: AirGapSchemeProvider, private schemeRouting: SchemeRoutingProvider, private alertCtrl: AlertController, private androidPermissions: AndroidPermissions, private rendererFactory: RendererFactory2, private navController: NavController, private platform: Platform, private secretsProvider: SecretsProvider, private transactionProvider: TransactionsProvider, private scanner: ScannerProvider) {
    this.renderer = this.rendererFactory.createRenderer(null, null)
  }

  ionViewWillEnter() {
    this.renderer.addClass(document.body, 'transparent-bg')

    this.platform.ready()
      .then(result => {
        return this.checkPermissions()
      })
      .then(permission => {
        if (!permission.hasPermission) {
          return this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
        }

        return Promise.resolve()
      }).then(result => {
        this.startScan()
      })
      .catch(error => {
        console.warn('permissions missing')
        console.warn(error)
      })
  }

  checkPermissions() {
    return this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA)
  }

  ionViewWillLeave() {
    this.scanner.destroy()
    this.renderer.removeClass(document.body, 'transparent-bg')
  }

  public startScan() {
    this.scanner.show()
    this.scanner.scan(text => {
      this.checkScan(text)
    }, error => {
      console.warn(error)
      this.startScan()
    })
  }

  async checkScan(data: string) {
    if (this.isAirGapTx(data)) {

      return this.schemeRouting.handleNewSyncRequest(this.navController, data, () => {
        this.startScan()
      })
    } else {
      this.extractRawTx(data).then(tx => {
        // this.transactionScanned(tx)
      }).catch(error => {
        console.warn(error)
        let alert = this.alertCtrl.create({
          title: 'Incompatible QR',
          message: 'This QR is not a raw transaction.',
          enableBackdropDismiss: false,
          buttons: [
            {
              text: 'Okay!',
              role: 'cancel',
              handler: () => {
                this.startScan()
              }
            }
          ]
        })
        alert.present()
      })
    }
  }

  isAirGapTx(qr: string): boolean {
    return qr.indexOf('airgap-vault://') !== -1
  }

  extractRawTx(qr: string): Promise<Transaction> {
    return new Promise((resolve, reject) => {
      let rawTx

      try {
        rawTx = JSON.parse(qr)
      } catch (err) {
        return reject(err)
      }

      let alert = this.alertCtrl.create()
      alert.setTitle('Select Wallet')

      const wallets = this.secretsProvider.getWallets()

      for (let wallet of wallets) {
        alert.addInput({
          type: 'radio',
          label: wallet.coinProtocol.name + ' ' + wallet.receivingPublicAddress,
          value: wallets.indexOf(wallet).toString()
        })
      }

      alert.addButton('Cancel')
      alert.addButton({
        text: 'Ok',
        handler: (walletIndex: string) => {
          const wallet = wallets[parseInt(walletIndex, 10)]
          rawTx.from = wallet.receivingPublicAddress
          const payload = rawTx

          try {
            const tx = this.transactionProvider.constructFromPayload(payload, wallet)
            resolve(tx)
          } catch (error) {
            return reject(error)
          }
        }
      })

      alert.present()
    })
  }

  simulateAirGapTx() {
    /*
    this.transactionScanned(this.schemeService.extractAirGapTx(
      'airgap-vault://sign?data=' + btoa(JSON.stringify({
        'protocolIdentifier': 'eth',
        'publicKey': '03c2c5da503a199294e2354425f9571d060a3a5971b4c61fcdccaf035d0fb18e6d',
        'payload': {
          'from': '0x7461531f581A662C5dF140FD6eA1317641fFcad2',
          'nonce': '0x00',
          'gasPrice': '0x04a817c800',
          'gasLimit': '0x5208',
          'to': '0xf5E54317822EBA2568236EFa7b08065eF15C5d42',
          'value': '0x0de0b6b3a7640000',
          'data': '0x',
          'chainId': 1
        }
      }))
    ))
    */
  }

  simulateTx() {
    this.extractRawTx(
      JSON.stringify(
        {
          'nonce': '0x00',
          'gasPrice': '0x04a817c800',
          'gasLimit': '0x5208',
          'to': '0x7461531f581A662C5dF140FD6eA1317641fFcad2',
          'value': '0x00',
          'data': '0x',
          'chainId': 1
        }
      )
    ).then(tx => {
      // this.transactionScanned(tx)
    })
  }
}
