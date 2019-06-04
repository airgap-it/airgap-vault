import { AirGapWallet } from 'airgap-coin-lib'
import { UUID } from 'angular2-uuid'

import { InteractionSetting } from './../services/interaction/interaction.service'
import { BIP39Signer } from './BIP39Signer'

const signer = new BIP39Signer()

export class Secret {
  public id: string = UUID.UUID()
  public label: string

  public secretHex: string
  public isParanoia: boolean
  public hasSocialRecovery: boolean
  public interactionSetting: InteractionSetting

  public wallets: AirGapWallet[]

  private readonly twofactor: string

  constructor(seed: string, label: string = '', isParanoia = false, interactionSetting = InteractionSetting.UNDETERMINED) {
    this.label = label
    this.isParanoia = isParanoia
    this.interactionSetting = interactionSetting

    // TODO: better check whether this is a mnemonic (validate)
    if (seed && seed.indexOf(' ') > -1) {
      seed = signer.mnemonicToEntropy(seed)
    }

    this.secretHex = seed
  }

  public flushSecret() {
    delete this.secretHex
  }

  public recoverMnemonicFromHex(hex: string): string {
    return signer.entropyToMnemonic(hex)
  }

  public hasTwofactor(): boolean {
    return this.twofactor && this.twofactor.length > 0
  }

  public static generateSocialRecover(secret: string, numberOfShares: number, threshold: number): string[] {
    return signer.generateSocialRecover(secret, numberOfShares, threshold)
  }

  public static recoverSecretFromShares(shares: string[]): string {
    return signer.recoverKey(shares)
  }

  public static init(obj) {
    return Object.assign(new Secret(null, obj.label), obj)
  }
}
