import { SecureStorageService } from './../storage/storage.service'
import { Injectable, NgZone } from '@angular/core'
import { Storage } from '@ionic/storage'
import { BehaviorSubject } from 'rxjs'

import { Secret } from '../../models/secret'
import { AirGapWallet, getProtocolByIdentifier } from 'airgap-coin-lib'
import { LoadingController, AlertController } from '@ionic/angular'

import bip39 from 'bip39'
import { handleErrorLocal, ErrorCategory } from './../error-handler/error-handler.service'

@Injectable({
  providedIn: 'root'
})
export class SecretsService {
  private activeSecret: Secret
  private secretsList: Secret[] = []
  public currentSecretsList = new BehaviorSubject(this.secretsList)
  private ready: Promise<void>

  constructor(
    private secureStorageService: SecureStorageService,
    private storage: Storage,
    private ngZone: NgZone,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    this.ready = this.init()
  }

  private async init(): Promise<void> {
    const secrets = await this.read()
    this.secretsList.push(...secrets.map(obj => Secret.init(obj)))
    this.activeSecret = this.secretsList[0]
    this.currentSecretsList.next(this.secretsList) // we need to force this update, as [] will not be broadcasted again
  }

  public isReady(): Promise<void> {
    return this.ready
  }

  private read(): Promise<Secret[]> {
    return new Promise((resolve, reject) => {
      this.storage
        .get('airgap-secret-list')
        .then(rawSecretsPayload => {
          // necessary due to double serialization bug we had
          let secrets: Secret[]
          if (typeof rawSecretsPayload === 'string') {
            secrets = JSON.parse(rawSecretsPayload)
          } else {
            secrets = rawSecretsPayload
          }
          if (!secrets) {
            secrets = []
          }
          for (let k = 0; k < secrets.length; k++) {
            const secret = secrets[k]
            if (secret.wallets) {
              for (let i = 0; i < secret.wallets.length; i++) {
                const wallet = secret.wallets[i]
                let airGapWallet = new AirGapWallet(
                  wallet.protocolIdentifier,
                  wallet.publicKey,
                  wallet.isExtendedPublicKey,
                  wallet.derivationPath
                )
                airGapWallet.addresses = wallet.addresses
                secret.wallets[i] = airGapWallet
              }
            } else {
              secrets[k].wallets = []
            }
          }
          resolve(secrets)
        })
        .catch(reject)
    })
  }

  addOrUpdateSecret(secret: Secret): Promise<void> {
    if (!secret.wallets) {
      secret.wallets = []
    }
    return new Promise((resolve, reject) => {
      if (!secret.secretHex) {
        this.secretsList[this.secretsList.findIndex(obj => obj.id === secret.id)] = secret
        this.persist()
          .then(resolve)
          .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
      } else {
        this.secureStorageService
          .get(secret.id, secret.isParanoia)
          .then(secureStorage => {
            return secureStorage.setItem(secret.id, secret.secretHex)
          })
          .then(
            _value => {
              secret.flushSecret()
              if (this.secretsList.findIndex(obj => obj.id === secret.id) === -1) {
                this.ngZone.run(() => {
                  this.secretsList.push(secret)
                  this.activeSecret = secret
                  this.persist()
                    .then(resolve)
                    .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
                })
              } else {
                this.activeSecret = secret
                this.persist()
                  .then(resolve)
                  .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
              }
            },
            error => {
              console.warn(error)
              reject(error)
            }
          )
      }
    })
  }

  remove(secret: Secret): Promise<void> {
    return new Promise(resolve => {
      return this.secureStorageService.get(secret.id, secret.isParanoia).then(secureStorage => {
        secureStorage
          .removeItem(secret.id)
          .then(() => {
            this.secretsList.splice(this.secretsList.indexOf(secret), 1)
            this.persist()
              .then(resolve)
              .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
          })
          .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
      })
    })
  }

  retrieveEntropyForSecret(secret: Secret): Promise<string> {
    return new Promise(resolve => {
      return this.secureStorageService.get(secret.id, secret.isParanoia).then(secureStorage => {
        resolve(secureStorage.getItem(secret.id))
      })
    })
  }

  findByPublicKey(pubKey: string): Secret {
    for (let secret of this.secretsList) {
      let foundWallet = secret.wallets.find(wallet => wallet.publicKey === pubKey)
      if (foundWallet !== undefined) {
        return secret
      }
    }
  }

  getWallets(): AirGapWallet[] {
    const walletList = []
    for (let secret of this.secretsList) {
      walletList.push(...secret.wallets)
    }
    return walletList
  }

  removeWallet(wallet: AirGapWallet): Promise<void> {
    const secret = this.findByPublicKey(wallet.publicKey)
    if (!secret) {
      return undefined
    }

    secret.wallets.splice(
      secret.wallets.findIndex(
        findWallet => findWallet.publicKey === wallet.publicKey && findWallet.protocolIdentifier === wallet.protocolIdentifier
      ),
      1
    )
    return this.addOrUpdateSecret(secret)
  }

  findWalletByPublicKeyAndProtocolIdentifier(pubKey: string, protocolIdentifier: string): AirGapWallet {
    const secret = this.findByPublicKey(pubKey)
    if (!secret) {
      return undefined
    }

    let foundWallet = secret.wallets.find(wallet => wallet.publicKey === pubKey && wallet.protocolIdentifier === protocolIdentifier)
    if (foundWallet !== undefined) {
      return foundWallet
    }
  }

  findBaseWalletByPublicKeyAndProtocolIdentifier(pubKey: string, protocolIdentifier: string): AirGapWallet | undefined {
    const secret = this.findByPublicKey(pubKey)
    if (!secret) {
      return undefined
    }

    return secret.wallets.find(wallet => wallet.publicKey === pubKey && protocolIdentifier.startsWith(wallet.protocolIdentifier))
  }

  getActiveSecret(): Secret {
    return this.activeSecret || this.secretsList[0]
  }

  setActiveSecret(secret: Secret): any {
    this.activeSecret = secret
  }

  persist(): Promise<void> {
    this.secretsList.forEach(obj => obj.flushSecret()) // make sure there are no secrets in there
    return this.storage.set('airgap-secret-list', this.secretsList)
  }

  addWallet(protocolIdentifier: string, isHDWallet: boolean, customDerivationPath: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const loading = await this.loadingCtrl.create({
        message: 'Deriving your wallet...'
      })
      loading.present().catch(handleErrorLocal(ErrorCategory.IONIC_LOADER))

      const protocol = getProtocolByIdentifier(protocolIdentifier)

      let secret = this.getActiveSecret()
      this.retrieveEntropyForSecret(secret)
        .then(entropy => {
          let seed = bip39.mnemonicToSeedHex(bip39.entropyToMnemonic(entropy))
          let wallet = new AirGapWallet(
            protocol.identifier,
            protocol.getPublicKeyFromHexSecret(seed, customDerivationPath),
            isHDWallet,
            customDerivationPath
          )
          wallet
            .deriveAddresses(1)
            .then(addresses => {
              wallet.addresses = addresses

              if (
                secret.wallets.find(obj => obj.publicKey === wallet.publicKey && obj.protocolIdentifier === wallet.protocolIdentifier) ===
                undefined
              ) {
                secret.wallets.push(wallet)
                resolve(this.addOrUpdateSecret(secret))
              } else {
                this.showAlert(
                  'Wallet already exists',
                  'You already have added this specific wallet. Please change its derivation path to add another address (advanced mode).'
                )
                reject()
              }
              loading.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_LOADER))
            })
            .catch(handleErrorLocal(ErrorCategory.WALLET_PROVIDER))
        })
        .catch(err => {
          this.showAlert('Error', err)
          loading.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_LOADER))
          reject()
        })
    })
  }

  async showAlert(title: string, message: string) {
    let alert = await this.alertCtrl.create({
      header: title,
      message,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Okay!',
          role: 'cancel'
        }
      ]
    })
    alert.present().catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
  }
}
