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

import { MnemonicSecret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../error-handler/error-handler.service'
import { NavigationService } from '../navigation/navigation.service'
import { SecureStorage, SecureStorageService } from '../secure-storage/secure-storage.service'
import { VaultStorageKey, VaultStorageService } from '../storage/storage.service'
import * as bitcoinJS from 'bitcoinjs-lib'

import * as bs58check from 'bs58check'
import { TranslateService } from '@ngx-translate/core'

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
    private readonly translateService: TranslateService,
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
        const serializedWallets: SerializedAirGapWallet[] = secret.wallets as unknown as SerializedAirGapWallet[]
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

      if (this.secretsList.findIndex((item: MnemonicSecret) => item.fingerprint === secret.fingerprint) !== -1) {
        const title: string = this.translateService.instant('secret-service.alert.title')
        const message: string = this.translateService.instant('secret-service.alert.message')
        this.showAlert(title, message)
        throw new Error('Already added secret')
      }

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

  public async removeWallets(wallets: AirGapWallet[]): Promise<void[]> {
    return Promise.all(wallets.map((wallet) => this.removeWallet(wallet)))
  }

  public async removeWallet(wallet: AirGapWallet): Promise<void> {
    const secret: MnemonicSecret | undefined = this.findByPublicKey(wallet.publicKey)
    if (!secret) {
      return undefined
    }

    wallet.status = AirGapWalletStatus.DELETED

    return this.addOrUpdateSecret(secret)
  }

  public async findWalletByPublicKeyAndProtocolIdentifier(pubKey: string, protocolIdentifier: ProtocolSymbols): Promise<AirGapWallet | undefined> {
    const secret: MnemonicSecret | undefined = this.findByPublicKey(pubKey)
    if (!secret) {
      return undefined
    }

    const filtered: (AirGapWallet | undefined)[] = await Promise.all(secret.wallets.map(async (wallet: AirGapWallet) => {
      return wallet.publicKey === pubKey && (await wallet.protocol.getIdentifier()) === protocolIdentifier ? wallet : undefined
    }))

    return filtered.find((wallet: AirGapWallet | undefined) => wallet !== undefined)
  }

  public async findWalletByFingerprintDerivationPathAndProtocolIdentifier(
    fingerprint: string,
    protocolIdentifier: ProtocolSymbols,
    derivationPath: string,
    publicKey: Buffer
  ): Promise<AirGapWallet | undefined> {
    const secret: MnemonicSecret | undefined = this.findByFingerprint(fingerprint)
    if (!secret) {
      return undefined
    }

    const filtered: (AirGapWallet | undefined)[] = await Promise.all(secret.wallets.map(async (wallet: AirGapWallet) => {
      const match = wallet.masterFingerprint === fingerprint && (await wallet.protocol.getIdentifier()) === protocolIdentifier
      if (match) {
        if (!derivationPath.startsWith(wallet.derivationPath)) {
          return undefined
        }

        // This uses the same logic to find child key as "sign" method in the BitcoinSegwitProtocol
        const bip32PK = bitcoinJS.bip32.fromBase58(new ExtendedPublicKey(wallet.publicKey).toXpub())
        const cutoffFrom = derivationPath.lastIndexOf("'") || derivationPath.lastIndexOf('h')
        const childPath = derivationPath.substr(cutoffFrom + 2)
        const walletPublicKey = bip32PK.derivePath(childPath).publicKey

        return publicKey.equals(walletPublicKey) ? wallet : undefined
      }

      return undefined
    }))

    return filtered.find((wallet: AirGapWallet | undefined) => wallet !== undefined)
  }

  /**
   * Find a wallet based on the source fingerprint of the xPub
   *
   * @param sourceFingerprint The fingerprint of the xPub
   * @param protocolIdentifier
   * @param derivationPath
   * @returns
   */
  public async findWalletByXPubFingerprintDerivationPathAndProtocolIdentifier(
    sourceFingerprint: string,
    protocolIdentifier: ProtocolSymbols,
    derivationPath: string
  ): Promise<AirGapWallet | undefined> {
    const filtered: (AirGapWallet | undefined)[] = await Promise.all(
      this.secretsList
        .reduce((pv, cv) => pv.concat(cv.wallets), [] as AirGapWallet[])
        .map(async (wallet: AirGapWallet) => {
          const match = wallet.isExtendedPublicKey && // Only extended public keys are relevant
          (await wallet.protocol.getIdentifier()) === protocolIdentifier &&
          `m/${derivationPath}`.startsWith(wallet.derivationPath) 
          
          return match ? wallet : undefined
        })
    )
    const allWallets: AirGapWallet[] = filtered.filter((wallet: AirGapWallet | undefined) => wallet !== undefined)

    const foundWallet: AirGapWallet | undefined = allWallets.find((wallet: AirGapWallet) => {
      const bip32PK = bitcoinJS.bip32.fromBase58(new ExtendedPublicKey(wallet.publicKey).toXpub())

      return bip32PK.fingerprint.toString('hex') === sourceFingerprint
    })

    return foundWallet
  }

  public async findBaseWalletByPublicKeyAndProtocolIdentifier(pubKey: string, protocolIdentifier: ProtocolSymbols): Promise<AirGapWallet | undefined> {
    const secret: MnemonicSecret | undefined = this.findByPublicKey(pubKey)
    if (!secret) {
      return undefined
    }

    const filtered: (AirGapWallet | undefined)[] = await Promise.all(secret.wallets.map(async (wallet: AirGapWallet) => {
      return wallet.publicKey === pubKey && protocolIdentifier.startsWith(await wallet.protocol.getIdentifier()) ? wallet : undefined
    }))

    return filtered.find((wallet: AirGapWallet | undefined) => wallet !== undefined)
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
    const secrets = await Promise.all(this.secretsList.map(async (secret) => {
      const storedSecret = storedSecrets.find((storedSecret) => storedSecret.id === secret.getIdentifier())
      if (storedSecret === undefined) {
        return secret
      }
      const wallets: SerializedAirGapWallet[] = await Promise.all(secret.wallets.slice(0).map((wallet: AirGapWallet) => wallet.toJSON()))
      for (let i = 0; i < storedSecret.wallets.length; ++i) {
        const serializedWallet = storedSecret.wallets[i] as unknown as SerializedAirGapWallet

        const filtered: (AirGapWallet | SerializedAirGapWallet | undefined)[] = await Promise.all(secret.wallets.map(async (wallet) => {
          const match = isAirGapWallet(wallet) &&
            (await wallet.protocol.getIdentifier()) === serializedWallet.protocolIdentifier &&
            wallet.publicKey === serializedWallet.publicKey
          
            return match ? wallet : undefined
        }))
        const found = filtered.find((wallet) => wallet !== undefined)
        if (found === undefined) {
          wallets.push(serializedWallet)
        }
      }
      const result = MnemonicSecret.init(secret)
      result.wallets = wallets as unknown as AirGapWallet[]
      return result
    }))

    return this.storageService.set(VaultStorageKey.AIRGAP_SECRET_LIST, secrets)
  }

  public async updateWallet(wallet: AirGapWallet): Promise<void> {
    const secret: MnemonicSecret | undefined = this.findByPublicKey(wallet.publicKey)
    if (secret === undefined) {
      return
    }

    await this.addOrUpdateSecret(secret)
  }

  public async addWallets(secret: MnemonicSecret, configs: AddWalletConifg[]): Promise<void> {
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
    const existingWallet: AirGapWallet | undefined = await this.findWalletByPublicKeyAndProtocolIdentifier(
      newWallet.publicKey,
      await newWallet.protocol.getIdentifier()
    )

    if (existingWallet === undefined) {
      return [newWallet, undefined]
    } else if (newWallet.status === AirGapWalletStatus.ACTIVE && existingWallet.status !== AirGapWalletStatus.ACTIVE) {
      existingWallet.status = AirGapWalletStatus.ACTIVE
      return [undefined, existingWallet]
    } else if (newWallet.status === AirGapWalletStatus.ACTIVE && existingWallet.status === AirGapWalletStatus.ACTIVE) {
      return undefined // TODO: Should we error if it already exists?
    } else {
      return undefined
    }
  }

  private async createNewWallet(entropy: string, config: AddWalletConifg): Promise<AirGapWallet> {
    const protocol: ICoinProtocol = await this.protocolService.getProtocol(config.protocolIdentifier)

    const mnemonic: string = bip39.entropyToMnemonic(entropy)
    const seed: Buffer = await bip39.mnemonicToSeed(mnemonic, config.bip39Passphrase)

    const bip32Node: bip32.BIP32Interface = bip32.fromSeed(seed)

    const publicKey: string =
      config.isHDWallet &&
      config.protocolIdentifier ===
        'eth' /* We need to check for ETH, because BTC returns an xPub for getPublicKeyFromMnemonic and getExtendedPublicKeyFromMnemonic doesn't exist */
        ? await (protocol as any).getExtendedPublicKeyFromMnemonic(mnemonic, config.customDerivationPath, config.bip39Passphrase)
        : await protocol.getPublicKeyFromMnemonic(mnemonic, config.customDerivationPath, config.bip39Passphrase)
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

  public async getKnownViewingKeys(): Promise<string[]> {
    const filtered: (string | undefined)[] = await Promise.all(this.getWallets().map(async (wallet: AirGapWallet) => {
      return (await wallet.protocol.getIdentifier()) === MainProtocolSymbols.XTZ_SHIELDED ? wallet.publicKey : undefined
    }))
    
    return filtered.filter((publicKey: string | undefined) => publicKey !== undefined)
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

function isAirGapWallet(value: AirGapWallet | SerializedAirGapWallet): value is AirGapWallet {
  return (value as any).protocol !== undefined
}
