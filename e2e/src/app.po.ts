import { browser, by, element } from 'protractor'
import { PageObjectBase } from './base.po'

export class AppPage extends PageObjectBase {
  public navigateTo() {
    return browser.get('/')
  }

  public clickAccept() {
    return this.clickButton('accept')
  }

  public clickContinue() {
    return this.clickButton('continue')
  }

  public openSecretImport() {
    return browser.get('/secret-import')
  }

  public clickImport() {
    return this.clickButton('import')
  }

  public clickConfirm() {
    return this.clickButton('confirm')
  }

  public clickAdd() {
    return this.clickButton('add')
  }

  public clickAuthenticate() {
    return this.clickButton('authenticate')
  }

  public clickImportMnemonic() {
    return this.clickButton('import-mnemonic')
  }

  public importMnemonic(mnemonic: string) {
    return this.enterTextareaText('mnemonic-input', mnemonic)
  }

  public inputMnemonicLabel(label: string) {
    return this.enterInputText('label', label)
  }

  public selectProtocol(protocolIdentifier: string) {
    return this.clickButton(`protocol-${protocolIdentifier}`)
  }

  public getPageTitle() {
    return element(by.css('ion-title')).getText()
  }
}
