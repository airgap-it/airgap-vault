import { Page } from './app.po'
import { browser, element, by, protractor } from 'protractor'
import * as fs from 'fs'

describe('App', () => {
  let page: Page

  beforeEach(() => {
    page = new Page()
  })

  describe('Home Screen', () => {
    beforeEach(() => {
      page.navigateTo('/')
      browser.executeScript(() => {
        localStorage.clear()
        localStorage.setItem('__airgap_storage/_ionickv/DISCLAIMER_INITIAL', 'true')
      })
    })

    it('should have a title saying "Ionic App"', () => {
      page.getTitle().then(title => {
        expect(title).toEqual('Ionic App')
      })
    })
  })
})
