import { SecretImportPage } from './secret-import.page'

describe('SecretImportPage', () => {
  function createComponent(): SecretImportPage {
    return new SecretImportPage({} as any, {} as any, {} as any)
  }

  it('validates a complete BIP39 mnemonic for the secret-import flow', () => {
    const component = createComponent()
    component.secretWords = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'.split(' ')

    expect(component.isValid()).toBe(true)
  })
})
