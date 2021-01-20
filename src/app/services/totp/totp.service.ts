import { Injectable } from '@angular/core'
import * as OTPAuth from 'otpauth'

// interface TotpState {
//   isSetup: boolean
//   secret: string
//   tries: Date[]
// }

@Injectable({
  providedIn: 'root'
})
export class TotpService {
  totp: OTPAuth.TOTP | undefined

  constructor() {
    this.initTotp()
  }

  initTotp() {
    this.totp = new OTPAuth.TOTP({
      issuer: 'AirGap Vault',
      label: '(vaultId)',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: 'NB2W45DFOIZA' // or "OTPAuth.Secret.fromB32('NB2W45DFOIZA')"
    })
  }

  resetTotp() {}

  getUrl() {
    return this.totp.toString()
  }

  validate(token: string): boolean {
    const delta = this.totp.validate({
      token: token,
      window: 1
    })

    return this.validateDelta(delta)
  }

  private validateDelta(delta: number | undefined): boolean {
    console.log('DELTA', delta)
    if (delta === undefined || delta === null || isNaN(delta)) {
      return false
    }

    return delta === 1 || delta === 0 || delta === -1
  }
}
