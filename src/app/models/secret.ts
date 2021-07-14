import { AirGapWallet } from '@airgap/coinlib-core'
import { UUID } from 'angular2-uuid'
import { fromSeed } from 'bip32'

import { toBoolean } from '../utils/utils'

import { InteractionSetting } from './../services/interaction/interaction.service'
import { BIPSigner } from './BIP39Signer'
import { Identifiable } from './identifiable'

const signer: BIPSigner = new BIPSigner()

export class Secret implements Identifiable {
  public id: string = UUID.UUID()
  public label: string

  public secretHex: string
  public isParanoia: boolean
  public hasSocialRecovery: boolean
  public interactionSetting: InteractionSetting
  public hasRecoveryKey: boolean

  public fingerprint?: string

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
      this.fingerprint = this.getFingerprintFromMnemonic(seed)
    }
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

  private getEntropyFromMnemonic(mnemonic: string): string {
    return this.isMnemonic(mnemonic) ? signer.mnemonicToEntropy(mnemonic) : mnemonic
  }

  private getMnemonicFromEntropy(entropy: string): string {
    return this.isMnemonic(entropy) ? entropy : signer.entropyToMnemonic(entropy)
  }

  private getFingerprintFromMnemonic(entropy: string): string {
    const mnemonic: string = this.getMnemonicFromEntropy(entropy)
    const seed: Buffer = signer.mnemonicToSeedSync(mnemonic)

    return fromSeed(seed).fingerprint.toString('hex')
  }

  private isMnemonic(data: string): boolean {
    // TODO: better check whether this is a mnemonic (validate)
    return data && data.indexOf(' ') > -1
  }
}
