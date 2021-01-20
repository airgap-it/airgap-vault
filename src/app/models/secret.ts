import { AirGapWallet } from '@airgap/coinlib-core'
import { UUID } from 'angular2-uuid'

import { toBoolean } from '../utils/utils'

import { InteractionSetting } from './../services/interaction/interaction.service'
import { BIP39Signer } from './BIP39Signer'
import { Identifiable } from './identifiable'

const signer: BIP39Signer = new BIP39Signer()

export enum SecretType {
  MNEMONIC = 'mnemonic',
  MNEMONIC_DURESS = 'mnemonic_duress',
  TWOFACTOR = 'twofactor',
  TEXT = 'text',
  SSH = 'ssh',
  PGP = 'pgp'
}

export class Secret implements Identifiable {
  public id: string = UUID.UUID()
  public label: string
  public description: string

  public secretHex: string
  public isParanoia: boolean
  public hasSocialRecovery: boolean
  public interactionSetting: InteractionSetting
  public hasRecoveryKey: boolean

  public secretType: SecretType

  public wallets: AirGapWallet[]

  private readonly twofactor: string

  constructor(
    seed: string | null,
    label: string = '',
    isParanoia: boolean = false,
    interactionSetting: InteractionSetting = InteractionSetting.UNDETERMINED,
    hasRecoveryKey: boolean = false
  ) {
    this.label = label
    this.isParanoia = isParanoia
    this.interactionSetting = interactionSetting
    this.hasRecoveryKey = hasRecoveryKey

    if (seed !== null) {
      this.secretHex = this.getEntropyFromMnemonic(seed)
    }
  }

  public getEntropyFromMnemonic(mnemonic: string): string {
    // TODO: better check whether this is a mnemonic (validate)
    return mnemonic && mnemonic.indexOf(' ') > -1 ? signer.mnemonicToEntropy(mnemonic) : mnemonic
  }

  public getIdentifier(): string {
    return this.id
  }

  public flushSecret(): void {
    delete this.secretHex
  }

  public recoverMnemonicFromHex(hex: string): string {
    return signer.entropyToMnemonic(hex)
  }

  public hasTwofactor(): boolean {
    return toBoolean(this.twofactor) && this.twofactor.length > 0
  }

  public static generateSocialRecover(secret: string, numberOfShares: number, threshold: number): string[] {
    return signer.generateSocialRecover(secret, numberOfShares, threshold)
  }

  public static recoverSecretFromShares(shares: string[]): string {
    return signer.recoverKey(shares)
  }

  public static init(obj: Secret): Secret {
    return Object.assign(new Secret(null, obj.label), obj)
  }
}
