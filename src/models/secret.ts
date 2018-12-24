import { UUID } from 'angular2-uuid'
import { BIP39Signer } from './BIP39Signer'
import { AirGapWallet } from 'airgap-coin-lib'

const signer = new BIP39Signer()

export enum SecretType {
  WALLET_SECRET,
  ONE_TIME_PASSWORD_GENERATOR
}

export class Secret {


  public id: string = UUID.UUID()
  public label: string

  public secretHex: string
  public isParanoia: boolean
  public hasSocialRecovery: boolean
  public secretType: SecretType

  public wallets: AirGapWallet[]

  private twofactor: string

  constructor(seed: string, label: string = '', isParanoia = false, secretType = SecretType.WALLET_SECRET) {
    this.label = label
    this.isParanoia = isParanoia
    this.secretType = secretType

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

  // TODO unsure if this is ther best place for such utility functions, maybe refactor and put into better place?
  static base32tohex(base32) {
    var base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    var bits = ''
    var hex = ''

    for (var i = 0; i < base32.length; i++) {
      var val = base32chars.indexOf(base32.charAt(i).toUpperCase())
      bits += Secret.leftpad(val.toString(2), 5, '0')
    }

    for (var i = 0; i + 4 <= bits.length; i += 4) {
      var chunk = bits.substr(i, 4)
      hex = hex + parseInt(chunk, 2).toString(16)
    }
    return hex
  }

  static toHexString(byteArray) {
    return byteArray.reduce((output, elem) =>
        (output + ('0' + elem.toString(16)).slice(-2)),
      '')
  }

  static hex2dec(s) {
    return parseInt(s, 16)
  }

  static dec2hex(s) {
    return (s < 15.5 ? '0' : '') + Math.round(s).toString(16)
  }

  static leftpad(str, len, pad) {
    if (len + 1 >= str.length) {
      str = Array(len + 1 - str.length).join(pad) + str
    }
    return str
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
