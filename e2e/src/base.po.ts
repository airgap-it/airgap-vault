// tslint:disable:no-implicit-dependencies
import { createWriteStream } from 'fs'
import { browser, by, element, ElementFinder, ExpectedConditions, promise } from 'protractor'

import { slugify } from './utils'

export class PageObjectBase {
  private readonly time: Date
  private readonly path: string
  protected tag: string

  constructor(tag: string, path: string, time: Date = new Date()) {
    this.tag = tag
    this.path = path
    this.time = time
  }

  public load(): promise.Promise<void> {
    return browser.get(this.path)
  }

  public rootElement(): ElementFinder {
    return element(by.css(this.tag))
  }

  public waitUntilInvisible(): promise.Promise<void> {
    return browser.wait(ExpectedConditions.invisibilityOf(this.rootElement()), 3000)
  }

  public waitUntilPresent(): promise.Promise<void> {
    return browser.wait(ExpectedConditions.presenceOf(this.rootElement()), 3000)
  }

  public waitUntilNotPresent(): promise.Promise<void> {
    return browser.wait(ExpectedConditions.not(ExpectedConditions.presenceOf(this.rootElement())), 3000)
  }

  public waitUntilVisible(): promise.Promise<void> {
    return browser.wait(ExpectedConditions.visibilityOf(this.rootElement()), 3000)
  }

  public waitForAngular(): promise.Promise<void> {
    return browser.waitForAngular()
  }

  public sleep(time: number): promise.Promise<void> {
    return browser.sleep(time)
  }

  public getTitle(): promise.Promise<string> {
    return element(by.css(`${this.tag} ion-title`)).getText()
  }

  public getParagraphText(): promise.Promise<string> {
    return element(by.deepCss('app-root ion-content')).getText()
  }

  public wait(time: number): promise.Promise<void> {
    return browser.sleep(time)
  }

  protected enterInputText(sel: string, text: string): promise.Promise<void> {
    const inputElement: ElementFinder = element(by.css(`[id="${sel}"]`))
    const input: ElementFinder = inputElement.element(by.css('input'))

    return input.sendKeys(text)
  }

  protected enterTextareaText(sel: string, text: string): promise.Promise<void> {
    const textareaElement: ElementFinder = element(by.css(`[id="${sel}"]`))
    const input: ElementFinder = textareaElement.element(by.css('textarea'))

    return input.sendKeys(text)
  }

  protected async clickButton(sel: string): Promise<void> {
    const button: ElementFinder = element(by.css(`[id="${sel}"]`))
    await browser.wait(ExpectedConditions.elementToBeClickable(button))

    await button.click()

    return this.waitForAngular()
  }

  public async takeScreenshot(name: string): Promise<void> {
    await browser.sleep(1000)

    // return browser.imageComparison.checkScreen(name)

    return browser
      .takeScreenshot()
      .then(async (png) => {
        const config: any = await browser.getProcessedConfig()

        const platform: string = config.capabilities.chromeOptions.mobileEmulation
          ? slugify(config.capabilities.chromeOptions.mobileEmulation.deviceName)
          : 'desktop'

        console.log(platform, 'screenshot', name)

        const stream = createWriteStream(`./screenshots/${platform}/${this.tag}-${this.time.getTime()}-${name}.png`)
        stream.write(Buffer.from(png, 'base64'))
        stream.end()
      })
      .catch((error) => console.error('Cannot take screenshot', error))
  }
}
