import { UUID } from 'angular2-uuid'
import { BIP39Signer } from './BIP39Signer'
import { AirGapWallet } from 'airgap-coin-lib'
import { InteractionSetting } from '../providers/interaction/interaction'

const signer = new BIP39Signer()

export class Secret {
  public id: string = UUID.UUID()
  public label: string

  public secretHex: string
  public isParanoia: boolean
  public hasSocialRecovery: boolean
  public interactionSetting: InteractionSetting
  public passphrase: string

  public wallets: AirGapWallet[]

  private twofactor: string
  

  constructor(seed: string, passphrase: string = '', label: string = '', isParanoia = false, interactionSetting = InteractionSetting.UNDETERMINED) {
    this.label = label
    this.isParanoia = isParanoia
    this.interactionSetting = interactionSetting
    this.passphrase = passphrase

    // TODO: better check whether this is a mnemonic (validate)
    if (seed && seed.indexOf(' ') > -1) {
      seed = signer.mnemonicToEntropy(seed)
    }

    this.secretHex = seed
  }

  flushSecret() {
    delete this.secretHex
  }

  recoverMnemonicFromHex(hex: string): string {
    return signer.entropyToMnemonic(hex)
  }

  hasTwofactor(): boolean {
    return this.twofactor && this.twofactor.length > 0
  }

  static generateSocialRecover(secret: string, numberOfShares: number, threshold: number): string[] {
    return signer.generateSocialRecover(secret, numberOfShares, threshold)
  }

  static recoverSecretFromShares(shares: string[]): string {
    return signer.recoverKey(shares)
  }

  static init(obj) {
    return Object.assign(new Secret(null, obj.label), obj)
  }
}
