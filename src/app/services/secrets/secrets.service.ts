import { Either, merged, ProtocolService } from '@airgap/angular-core'
import {
  AirGapWallet,
  AirGapWalletStatus,
  ICoinProtocol,
  ProtocolSymbols,
  SerializedAirGapWallet,
  TezosSaplingProtocol
} from '@airgap/coinlib-core'
import { Injectable } from '@angular/core'
import { AlertController, LoadingController } from '@ionic/angular'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import { Observable, ReplaySubject } from 'rxjs'

import { MnemonicSecret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { NavigationService } from '../navigation/navigation.service'
import { SecureStorage, SecureStorageService } from '../secure-storage/secure-storage.service'
import { VaultStorageKey, VaultStorageService } from '../storage/storage.service'
import * as bitcoinJS from 'bitcoinjs-lib'

import * as bs58check from 'bs58check'

class ExtendedPublicKey {
  private readonly rawKey: Buffer
  constructor(extendedPublicKey: string) {
    this.rawKey = bs58check.decode(extendedPublicKey).slice(4)
  }

  toXpub() {
    return this.addPrefix('0488b21e')
  }

  toYPub() {
    return this.addPrefix('049d7cb2')
  }

  toZPub() {
    return this.addPrefix('04b24746')
  }

  private addPrefix(prefix: string) {
    const data = Buffer.concat([Buffer.from(prefix, 'hex'), this.rawKey])
    return bs58check.encode(data)
  }
}

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
  private readonly secretsList: MnemonicSecret[] = []
  private activeSecret: MnemonicSecret

  private readonly activeSecret$: ReplaySubject<MnemonicSecret> = new ReplaySubject(1)
  private readonly secrets$: ReplaySubject<MnemonicSecret[]> = new ReplaySubject(1)

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
    const secrets: MnemonicSecret[] = await this.read()
    this.secretsList.push(...secrets.map((obj: MnemonicSecret) => MnemonicSecret.init(obj)))
    this.secrets$.next(this.secretsList)
    this.activeSecret = this.secretsList[0]
    this.activeSecret$.next(this.activeSecret)
  }

  public isReady(): Promise<void> {
    return this.ready
  }

  private async read(): Promise<MnemonicSecret[]> {
    const rawSecretsPayload: unknown = await this.storageService.get(VaultStorageKey.AIRGAP_SECRET_LIST)

    // necessary due to double serialization bug we had
    let secrets: MnemonicSecret[] = typeof rawSecretsPayload === 'string' ? JSON.parse(rawSecretsPayload) : rawSecretsPayload

    if (!secrets) {
      secrets = []
    }

    for (let k: number = 0; k < secrets.length; k++) {
      const secret: MnemonicSecret = secrets[k]
      if (secret.wallets) {
        const serializedWallets: SerializedAirGapWallet[] = (secret.wallets as unknown) as SerializedAirGapWallet[]
        const wallets = (
          await Promise.all(
            serializedWallets.map(async (serializedWallet) => {
              const protocol: ICoinProtocol | undefined = await this.protocolService
                .getProtocol(serializedWallet.protocolIdentifier)
                .catch((error) => {
                  console.error(error)
                  return undefined
                })
              if (protocol === undefined) {
                return undefined
              }
              const airGapWallet: AirGapWallet = new AirGapWallet(
                protocol,
                serializedWallet.publicKey,
                serializedWallet.isExtendedPublicKey,
                serializedWallet.derivationPath,
                serializedWallet.masterFingerprint ?? '',
                serializedWallet.status ?? AirGapWalletStatus.ACTIVE
              )
              airGapWallet.addresses = serializedWallet.addresses
              return airGapWallet
            })
          )
        ).filter((wallet) => wallet !== undefined)
        secrets[k].wallets = wallets
      } else {
        secrets[k].wallets = []
      }
    }

    return secrets
  }

  public async addOrUpdateSecret(secret: MnemonicSecret, options: { setActive: boolean } = { setActive: true }): Promise<void> {
    if (!secret.wallets) {
      secret.wallets = []
    }

    if (!secret.secretHex) {
      this.secretsList[this.secretsList.findIndex((item: MnemonicSecret) => item.id === secret.id)] = secret

      if (options.setActive) {
        this.setActiveSecret(secret)
      }

      return this.persist()
    } else {
      const secureStorage: SecureStorage = await this.secureStorageService.get(secret.id, secret.isParanoia)

      await secureStorage.setItem(secret.id, secret.secretHex)

      secret.flushSecret()

      // It's a new secret, push to array
      if (this.secretsList.findIndex((item: MnemonicSecret) => item.id === secret.id) === -1) {
        this.secretsList.push(secret)
        this.secrets$.next(this.secretsList)
      }

      if (options.setActive) {
        this.setActiveSecret(secret)
      }

      return this.persist()
    }
  }

  public async remove(secret: MnemonicSecret): Promise<void> {
    const secureStorage: SecureStorage = await this.secureStorageService.get(secret.id, secret.isParanoia)

    await secureStorage.removeItem(secret.id)

    this.secretsList.splice(this.secretsList.indexOf(secret), 1)
    this.secrets$.next(this.secretsList)

    if (this.activeSecret === secret) {
      this.setActiveSecret(this.secretsList[0])
    }

    await this.persist()
  }

  public async resetRecoveryPassword(secret: MnemonicSecret): Promise<string> {
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

  public async retrieveEntropyForSecret(secret: MnemonicSecret): Promise<string> {
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

  public findByFingerprint(fingerprint: string): MnemonicSecret | undefined {
    for (const secret of this.secretsList) {
      const foundWallet: AirGapWallet | undefined = secret.wallets.find((wallet: AirGapWallet) => wallet.masterFingerprint === fingerprint)
      if (foundWallet !== undefined) {
        return secret
      }
    }

    return undefined
  }

  public findByPublicKey(pubKey: string): MnemonicSecret | undefined {
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
    const secret: MnemonicSecret | undefined = this.findByPublicKey(wallet.publicKey)
    if (!secret) {
      return undefined
    }

    wallet.status = AirGapWalletStatus.DELETED

    return this.addOrUpdateSecret(secret)
  }

  public findWalletByPublicKeyAndProtocolIdentifier(pubKey: string, protocolIdentifier: ProtocolSymbols): AirGapWallet | undefined {
    const secret: MnemonicSecret | undefined = this.findByPublicKey(pubKey)
    if (!secret) {
      return undefined
    }

    const foundWallet: AirGapWallet | undefined = secret.wallets.find(
      (wallet: AirGapWallet) => wallet.publicKey === pubKey && wallet.protocol.identifier === protocolIdentifier
    )

    return foundWallet
  }

  public findWalletByFingerprintDerivationPathAndProtocolIdentifier(
    fingerprint: string,
    protocolIdentifier: ProtocolSymbols,
    derivationPath: string,
    publicKey: Buffer
  ): AirGapWallet | undefined {
    const secret: MnemonicSecret | undefined = this.findByFingerprint(fingerprint)
    if (!secret) {
      return undefined
    }

    const foundWallet: AirGapWallet | undefined = secret.wallets.find((wallet: AirGapWallet) => {
      const match = wallet.masterFingerprint === fingerprint && wallet.protocol.identifier === protocolIdentifier
      if (match) {
        if (!derivationPath.startsWith(wallet.derivationPath)) {
          return false
        }

        // This uses the same logic to find child key as "sign" method in the BitcoinSegwitProtocol
        const bip32PK = bitcoinJS.bip32.fromBase58(new ExtendedPublicKey(wallet.publicKey).toXpub())
        const cutoffFrom = derivationPath.lastIndexOf("'") || derivationPath.lastIndexOf('h')
        const childPath = derivationPath.substr(cutoffFrom + 2)
        const walletPublicKey = bip32PK.derivePath(childPath).publicKey

        return publicKey.equals(walletPublicKey)
      }
      return false
    })

    return foundWallet
  }

  public findBaseWalletByPublicKeyAndProtocolIdentifier(pubKey: string, protocolIdentifier: ProtocolSymbols): AirGapWallet | undefined {
    const secret: MnemonicSecret | undefined = this.findByPublicKey(pubKey)
    if (!secret) {
      return undefined
    }

    return secret.wallets.find(
      (wallet: AirGapWallet) => wallet.publicKey === pubKey && protocolIdentifier.startsWith(wallet.protocol.identifier)
    )
  }

  public getActiveSecret(): MnemonicSecret {
    return this.activeSecret || this.secretsList[0]
  }

  public setActiveSecret(secret: MnemonicSecret): void {
    this.activeSecret = secret
    this.activeSecret$.next(secret)
  }

  public getActiveSecretObservable(): Observable<MnemonicSecret> {
    return this.activeSecret$.asObservable()
  }

  public getSecretsObservable(): Observable<MnemonicSecret[]> {
    return this.secrets$.asObservable()
  }

  private async persist(): Promise<void> {
    this.secretsList.forEach((secret: MnemonicSecret) => {
      secret.flushSecret()
    })

    const rawSecretsPayload: unknown = await this.storageService.get(VaultStorageKey.AIRGAP_SECRET_LIST)

    // necessary due to double serialization bug we had
    const storedSecrets: MnemonicSecret[] = typeof rawSecretsPayload === 'string' ? JSON.parse(rawSecretsPayload) : rawSecretsPayload
    const secrets = this.secretsList.map((secret) => {
      const storedSecret = storedSecrets.find((storedSecret) => storedSecret.id === secret.getIdentifier())
      if (storedSecret === undefined) {
        return secret
      }
      const wallets: (AirGapWallet | SerializedAirGapWallet)[] = secret.wallets.slice(0)
      for (let i = 0; i < storedSecret.wallets.length; ++i) {
        const serializedWallet = (storedSecret.wallets[i] as unknown) as SerializedAirGapWallet
        const found = wallets.find(
          (wallet) =>
            isAirGapWallet(wallet) &&
            wallet.protocol.identifier === serializedWallet.protocolIdentifier &&
            wallet.publicKey === serializedWallet.publicKey
        )
        if (found === undefined) {
          wallets.push(serializedWallet)
        }
      }
      const result = MnemonicSecret.init(secret)
      result.wallets = (wallets as unknown) as AirGapWallet[]
      return result
    })

    return this.storageService.set(VaultStorageKey.AIRGAP_SECRET_LIST, secrets)
  }

  public async updateWallet(wallet: AirGapWallet): Promise<void> {
    const secret: MnemonicSecret | undefined = this.findByPublicKey(wallet.publicKey)
    if (secret === undefined) {
      return
    }

    await this.addOrUpdateSecret(secret)
  }

  public async addWallets(configs: AddWalletConifg[]): Promise<void> {
    const loading: HTMLIonLoadingElement = await this.loadingCtrl.create({
      message: 'Deriving your wallet...'
    })
    loading.present().catch(handleErrorLocal(ErrorCategory.IONIC_LOADER))

    try {
      const secret: MnemonicSecret = this.getActiveSecret()
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
      .filter((wallet: AirGapWallet) => wallet.protocol instanceof TezosSaplingProtocol)
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
    await this.navigationService.routeToAccountsTab(true)
  }
}

function isAirGapWallet(value: AirGapWallet | SerializedAirGapWallet): value is AirGapWallet {
  return (value as any).protocol !== undefined
}
