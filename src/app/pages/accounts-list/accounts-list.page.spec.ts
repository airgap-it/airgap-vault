import { AirGapWallet } from '@airgap/coinlib-core'
import { Router } from '@angular/router'
import { AlertController, Platform, PopoverController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'

import { ModeService } from 'src/app/services/mode/mode.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { SecretsService } from 'src/app/services/secrets/secrets.service'

import { AccountsListPage } from './accounts-list.page'

describe('AccountsListPage', () => {
  let component: AccountsListPage

  beforeEach(() => {
    component = new AccountsListPage(
      { is: (): boolean => false } as unknown as Platform,
      {} as NavigationService,
      {} as ModeService,
      {} as AlertController,
      {} as TranslateService,
      {} as SecretsService,
      {} as Router,
      {} as PopoverController
    )
  })

  ;['Enter', ' ', 'Spacebar'].forEach((key) => {
    it(`activates an account row for ${key === ' ' ? 'Space' : key}`, () => {
      const event = { key, preventDefault: jasmine.createSpy('preventDefault') } as unknown as KeyboardEvent
      const wallet = {} as AirGapWallet
      spyOn(component, 'goToReceiveAddress')

      component.onWalletKeydown(event, wallet)

      expect(event.preventDefault).toHaveBeenCalled()
      expect(component.goToReceiveAddress).toHaveBeenCalledWith(wallet)
    })
  })

  it('does not activate an account row for other keys', () => {
    const event = { key: 'ArrowDown', preventDefault: jasmine.createSpy('preventDefault') } as unknown as KeyboardEvent
    spyOn(component, 'goToReceiveAddress')

    component.onWalletKeydown(event, {} as AirGapWallet)

    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(component.goToReceiveAddress).not.toHaveBeenCalled()
  })

  it('uses the visible account fields as the account accessibility label', async () => {
    const wallet = {
      protocol: {
        getName: async (): Promise<string> => 'Bitcoin',
        getSymbol: async (): Promise<string> => 'BTC'
      },
      receivingPublicAddress: 'bc1-account'
    } as unknown as AirGapWallet
    component.secret = { wallets: [wallet] } as any

    await (component as any).loadWallets()

    expect(component.visibleAccountLabel(wallet)).toBe('Bitcoin, BTC, bc1-account')
  })
})
