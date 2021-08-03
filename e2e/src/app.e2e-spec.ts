import { AppPage } from './app.po'

const TEST_MNEMONIC: string = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
const TEST_MNEMONIC_LABEL: string = 'Test'

describe('new App', () => {
  let page: AppPage

  beforeEach(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000

    page = new AppPage('app-root', '/')
    await page.load()
    console.log(TEST_MNEMONIC)
  })

  it('should display welcome message', async (done) => {
    console.log('starting test')
    // browser.executeScript('window.localStorage.setItem();')
    await page.clickAccept()
    await page.takeScreenshot('welcome-1')
    await page.clickContinue()
    await page.takeScreenshot('welcome-2')
    await page.openSecretImport()
    // await page.clickImport()
    await page.takeScreenshot('welcome-3')
    await page.importMnemonic(TEST_MNEMONIC)
    await page.takeScreenshot('welcome-4')
    await page.clickImportMnemonic()
    await page.takeScreenshot('welcome-5')
    await page.inputMnemonicLabel(TEST_MNEMONIC_LABEL)
    await page.takeScreenshot('welcome-6')
    await page.clickConfirm()
    await page.takeScreenshot('welcome-7')
    await page.selectProtocol('eth')
    await page.takeScreenshot('welcome-8')
    await page.clickAdd()
    await page.takeScreenshot('welcome-9')
    await page.clickAuthenticate()
    await page.wait(1000)
    await page.takeScreenshot('welcome-10')
    const title = page.getPageTitle()
    await expect(title).toEqual('Accounts')
    done()
  })

  // it('should display welcome 2', async (done) => {
  //   page.navigateTo()
  //   await page.takeScreenshot('welcome')
  //   const title = page.getPageTitle()
  //   await expect(title).toEqual('')
  //   done()
  // })
})
