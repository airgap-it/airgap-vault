import { SocialRecoveryImportShareValidatePage } from './social-recovery-import-share-validate.page'
import * as bip39 from 'bip39'

describe('SocialRecoveryImportShareValidatePage', () => {
  function createComponent(): SocialRecoveryImportShareValidatePage {
    return new SocialRecoveryImportShareValidatePage({} as any, {} as any, {} as any, {} as any, {} as any)
  }

  it('requires two valid 24-word mnemonics for the social-recovery flow', () => {
    const component = createComponent()
    const mnemonic = bip39.entropyToMnemonic('0000000000000000000000000000000000000000000000000000000000000000')
    component.secretWords = `${mnemonic} ${mnemonic}`.split(' ')

    expect(component.isValid()).toBe(true)
    component.secretWords = mnemonic.split(' ')
    expect(component.isValid()).toBe(false)
  })
})
