import { AccountSummaryComponent } from './account-summary.component'

describe('AccountSummaryComponent', () => {
  const wallet: any = {
    receivingPublicAddress: 'tz1-account',
    protocol: {
      getName: () => Promise.resolve('Tezos'),
      getSymbol: () => Promise.resolve('XTZ'),
      getIdentifier: () => Promise.resolve('xtz')
    }
  }

  it('exposes the complete account identity as one accessible label', async () => {
    const component = new AccountSummaryComponent()
    component.wallet = wallet
    component.label = 'Primary secret'

    await component.ngOnChanges({} as any)

    expect(component.accessibleLabel).toBe('Tezos, XTZ, Primary secret, tz1-account')
  })

  it('emits only when configured as selectable', () => {
    const component = new AccountSummaryComponent()
    component.wallet = wallet
    const selected = jasmine.createSpy('selected')
    component.selected.subscribe(selected)

    component.select()
    expect(selected).not.toHaveBeenCalled()

    component.selectable = true
    component.select()
    expect(selected).toHaveBeenCalledWith(wallet)
  })
})
