import { Either, merged, ProtocolService } from '@airgap/angular-core'
import {
  AirGapWallet,
  AirGapWalletStatus,
  ICoinProtocol,
  MainProtocolSymbols,
  ProtocolSymbols,
  SerializedAirGapWallet
} from '@airgap/coinlib-core'
import { Injectable } from '@angular/core'
import { AlertController, LoadingController } from '@ionic/angular'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import { Observable, ReplaySubject } from 'rxjs'

import { Secret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { NavigationService } from '../navigation/navigation.service'
import { SecureStorage, SecureStorageService } from '../secure-storage/secure-storage.service'
import { VaultStorageKey, VaultStorageService } from '../storage/storage.service'

interface AddWalletConifg {
  protocolIdentifier: ProtocolSymbols
  isHDWallet: boolean
  customDerivationPath: string
  bip39Passphrase: string
  isActive: boolean
}
@Injectable({
  providedIn: 'root'
})
export class SecretsService {
  private readonly ready: Promise<void>
  private readonly secretsList: Secret[] = []
  private activeSecret: Secret

  private readonly activeSecret$: ReplaySubject<Secret> = new ReplaySubject(1)
  private readonly secrets$: ReplaySubject<Secret[]> = new ReplaySubject(1)

  constructor(
    private readonly secureStorageService: SecureStorageService,
    private readonly storageService: VaultStorageService,
    private readonly protocolService: ProtocolService,
    private readonly navigationService: NavigationService,
    private readonly loadingCtrl: LoadingController,
    private readonly alertCtrl: AlertController
  ) {
    this.ready = this.init()
  }

  private async init(): Promise<void> {
    const secrets: Secret[] = await this.read()
    this.secretsList.push(...secrets.map((obj: Secret) => Secret.init(obj)))
    this.secrets$.next(this.secretsList)
    this.activeSecret = this.secretsList[0]
    this.activeSecret$.next(this.activeSecret)
  }

  public isReady(): Promise<void> {
    return this.ready
  }

  private async read(): Promise<Secret[]> {
    const rawSecretsPayload: unknown = await this.storageService.get(VaultStorageKey.AIRGAP_SECRET_LIST)

    // necessary due to double serialization bug we had
    let secrets: Secret[] = typeof rawSecretsPayload === 'string' ? JSON.parse(rawSecretsPayload) : rawSecretsPayload

    if (!secrets) {
      secrets = []
    }

    for (let k: number = 0; k < secrets.length; k++) {
      const secret: Secret = secrets[k]
      if (secret.wallets) {
        for (let i: number = 0; i < secret.wallets.length; i++) {
          const wallet: SerializedAirGapWallet = (secret.wallets[i] as any) as SerializedAirGapWallet
          const protocol: ICoinProtocol = await this.protocolService.getProtocol(wallet.protocolIdentifier)
          const airGapWallet: AirGapWallet = new AirGapWallet(
            protocol,
            wallet.publicKey,
            wallet.isExtendedPublicKey,
            wallet.derivationPath,
            wallet.masterFingerprint ?? '',
            wallet.status ?? AirGapWalletStatus.ACTIVE
          )
          airGapWallet.addresses = wallet.addresses
          secret.wallets[i] = airGapWallet
        }
      } else {
        secrets[k].wallets = []
      }
    }

    return secrets
  }

  public async addOrUpdateSecret(secret: Secret, options: { setActive: boolean } = { setActive: true }): Promise<void> {
    if (!secret.wallets) {
      secret.wallets = []
    }

    if (!secret.secretHex) {
      this.secretsList[this.secretsList.findIndex((item: Secret) => item.id === secret.id)] = secret

      if (options.setActive) {
        this.setActiveSecret(secret)
      }

      return this.persist()
    } else {
      const secureStorage: SecureStorage = await this.secureStorageService.get(secret.id, secret.isParanoia)

      await secureStorage.setItem(secret.id, secret.secretHex)

      secret.flushSecret()

      // It's a new secret, push to array
      if (this.secretsList.findIndex((item: Secret) => item.id === secret.id) === -1) {
        this.secretsList.push(secret)
        this.secrets$.next(this.secretsList)
      }

      if (options.setActive) {
        this.setActiveSecret(secret)
      }

      return this.persist()
    }
  }

  public async remove(secret: Secret): Promise<void> {
    const secureStorage: SecureStorage = await this.secureStorageService.get(secret.id, secret.isParanoia)

    await secureStorage.removeItem(secret.id)

    this.secretsList.splice(this.secretsList.indexOf(secret), 1)
    this.secrets$.next(this.secretsList)

    if (this.activeSecret === secret) {
      this.setActiveSecret(this.secretsList[0])
    }

    await this.persist()
  }

  public async resetRecoveryPassword(secret: Secret): Promise<string> {
    const secureStorage: SecureStorage = await this.secureStorageService.get(secret.id, secret.isParanoia)
    try {
      const secretHex = await secureStorage.getItem(secret.id).then((result) => result.value)

      return secureStorage.setupRecoveryPassword(secret.id, secretHex).then((result) => {
        secret.hasRecoveryKey = true
        this.addOrUpdateSecret(secret)

        return result.recoveryKey
      })
    } catch (error) {
      if (error.message.startsWith('Could not read from the secure storage.')) {
        this.handleCorruptedSecret(error)
      }
      throw error
    }
  }

  public async retrieveEntropyForSecret(secret: Secret): Promise<string> {
    const secureStorage: SecureStorage = await this.secureStorageService.get(secret.id, secret.isParanoia)

    return secureStorage
      .getItem(secret.id)
      .then((result) => {
        return result.value
      })
      .catch((error) => {
        if (error.message.startsWith('Could not read from the secure storage.')) {
          this.handleCorruptedSecret(error)
        }
        throw error
      })
  }

  public findByPublicKey(pubKey: string): Secret | undefined {
    for (const secret of this.secretsList) {
      const foundWallet: AirGapWallet | undefined = secret.wallets.find((wallet: AirGapWallet) => wallet.publicKey === pubKey)
      if (foundWallet !== undefined) {
        return secret
      }
    }

    return undefined
  }

  public getWallets(): AirGapWallet[] {
    const walletList: AirGapWallet[] = []
    for (const secret of this.secretsList) {
      walletList.push(...secret.wallets)
    }

    return walletList
  }

  public async removeWallet(wallet: AirGapWallet): Promise<void> {
    const secret: Secret | undefined = this.findByPublicKey(wallet.publicKey)
    if (!secret) {
      return undefined
    }

    wallet.status = AirGapWalletStatus.DELETED

    return this.addOrUpdateSecret(secret)
  }

  public findWalletByPublicKeyAndProtocolIdentifier(pubKey: string, protocolIdentifier: ProtocolSymbols): AirGapWallet | undefined {
    const secret: Secret | undefined = this.findByPublicKey(pubKey)
    if (!secret) {
      return undefined
    }

    const foundWallet: AirGapWallet | undefined = secret.wallets.find(
      (wallet: AirGapWallet) => wallet.publicKey === pubKey && wallet.protocol.identifier === protocolIdentifier
    )

    return foundWallet
  }

  public findBaseWalletByPublicKeyAndProtocolIdentifier(pubKey: string, protocolIdentifier: ProtocolSymbols): AirGapWallet | undefined {
    const secret: Secret | undefined = this.findByPublicKey(pubKey)
    if (!secret) {
      return undefined
    }

    return secret.wallets.find(
      (wallet: AirGapWallet) => wallet.publicKey === pubKey && protocolIdentifier.startsWith(wallet.protocol.identifier)
    )
  }

  public getActiveSecret(): Secret {
    return this.activeSecret || this.secretsList[0]
  }

  public setActiveSecret(secret: Secret): void {
    this.activeSecret = secret
    this.activeSecret$.next(secret)
  }

  public getActiveSecretObservable(): Observable<Secret> {
    return this.activeSecret$.asObservable()
  }

  public getSecretsObservable(): Observable<Secret[]> {
    return this.secrets$.asObservable()
  }

  public persist(): Promise<void> {
    this.secretsList.forEach((secret: Secret) => {
      secret.flushSecret()
    })

    return this.storageService.set(VaultStorageKey.AIRGAP_SECRET_LIST, this.secretsList)
  }

  public async updateWallet(wallet: AirGapWallet): Promise<void> {
    const secret: Secret | undefined = await this.findByPublicKey(wallet.publicKey)
    if (secret === undefined) {
      return
    }

    await this.addOrUpdateSecret(secret)
  }

  public async addWallets(secret: Secret, configs: AddWalletConifg[]): Promise<void> {
    const loading: HTMLIonLoadingElement = await this.loadingCtrl.create({
      message: 'Deriving your wallet...'
    })
    loading.present().catch(handleErrorLocal(ErrorCategory.IONIC_LOADER))

    try {
      const entropy: string = await this.retrieveEntropyForSecret(secret)

      const createdOrUpdated: Either<AirGapWallet, AirGapWallet>[] = (
        await Promise.all(configs.map((config: AddWalletConifg) => this.activateOrCreateWallet(entropy, config)))
      ).filter((createdOrUpdated: Either<AirGapWallet, AirGapWallet> | undefined) => createdOrUpdated !== undefined)

      const [createdWallets, updatedWallets]: [AirGapWallet[], AirGapWallet[]] = merged(createdOrUpdated)

      if (createdWallets.length > 0 || updatedWallets.length > 0) {
        secret.wallets.push(...createdWallets)
        await this.addOrUpdateSecret(secret)
      }

      loading.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_LOADER))
    } catch (error) {
      loading.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_LOADER))

      let header: string | undefined
      let message: string | undefined
      // minimal solution without dependency
      if (error.message?.toLowerCase().startsWith('Expected BIP32 derivation path')) {
        message = 'Expected BIP32 derivation path, got invalid string'
      } else if (error.message?.toLowerCase().startsWith('wallet already exists')) {
        header = 'Wallet already exists'
        message = 'You already have added this specific wallet. Please change its derivation path to add another address (advanced mode).'
      }

      if (message) {
        this.showAlert(header ?? 'Error', message).catch(handleErrorLocal(ErrorCategory.IONIC_ALERT))
      }
      throw error
    }
  }

  private async activateOrCreateWallet(entropy: string, config: AddWalletConifg): Promise<Either<AirGapWallet, AirGapWallet> | undefined> {
    const newWallet: AirGapWallet = await this.createNewWallet(entropy, config)
    const existingWallet: AirGapWallet | undefined = this.findWalletByPublicKeyAndProtocolIdentifier(
      newWallet.publicKey,
      newWallet.protocol.identifier
    )

    if (existingWallet === undefined) {
      return [newWallet, undefined]
    } else if (newWallet.status === AirGapWalletStatus.ACTIVE && existingWallet.status !== AirGapWalletStatus.ACTIVE) {
      existingWallet.status = AirGapWalletStatus.ACTIVE
      return [undefined, existingWallet]
    } else if (newWallet.status === AirGapWalletStatus.ACTIVE && existingWallet.status === AirGapWalletStatus.ACTIVE) {
      throw new Error('Wallet already exists')
    } else {
      return undefined
    }
  }

  private async createNewWallet(entropy: string, config: AddWalletConifg): Promise<AirGapWallet> {
    const protocol: ICoinProtocol = await this.protocolService.getProtocol(config.protocolIdentifier)

    const mnemonic: string = bip39.entropyToMnemonic(entropy)
    const seed: Buffer = await bip39.mnemonicToSeed(mnemonic, config.bip39Passphrase)

    const bip32Node: bip32.BIP32Interface = bip32.fromSeed(seed)

    const publicKey: string = await protocol.getPublicKeyFromMnemonic(mnemonic, config.customDerivationPath, config.bip39Passphrase)
    const fingerprint: string = bip32Node.fingerprint.toString('hex')

    const wallet: AirGapWallet = new AirGapWallet(
      protocol,
      publicKey,
      config.isHDWallet,
      config.customDerivationPath,
      fingerprint,
      config.isActive ? AirGapWalletStatus.ACTIVE : AirGapWalletStatus.HIDDEN
    )

    const addresses: string[] = await wallet.deriveAddresses(1)
    wallet.addresses = addresses

    return wallet
  }

  public getKnownViewingKeys(): string[] {
    return this.getWallets()
      .filter((wallet: AirGapWallet) => wallet.protocol.identifier === MainProtocolSymbols.XTZ_SHIELDED)
      .map((wallet: AirGapWallet) => wallet.publicKey)
  }

  public async showAlert(title: string, message: string): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertCtrl.create({
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

  private async handleCorruptedSecret(error: any): Promise<void> {
    error.message += ' Please, re-import your secret.'
    error.ignore = true

    await this.showAlert('Error', error.message)
    await this.navigationService.routeToSecretsTab(true)
  }
}
