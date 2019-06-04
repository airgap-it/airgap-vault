import { browser, by, element } from 'protractor'

export class AppPage {
  public navigateTo() {
    return browser.get('/')
  }

  public getPageTitle() {
    return element(by.css('ion-title')).getText()
  }
}
