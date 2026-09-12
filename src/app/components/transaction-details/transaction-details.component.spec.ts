import { TransactionDetailsComponent } from './transaction-details.component'

describe('TransactionDetailsComponent', () => {
  it('prepares address, contact, and labeled details without layout-only state', () => {
    const clipboard = { copyAndShowToast: jasmine.createSpy('copyAndShowToast') }
    const component = new TransactionDetailsComponent(clipboard as any)
    component.transaction = {
      from: ['from-address'],
      to: ['to-address'],
      displayFromTo: true,
      extra: { names: { 'from-address': 'Sender', 'to-address': 'Recipient' }, labeled: { Memo: 'Invoice 42' } }
    } as any

    component.ngOnChanges({} as any)

    expect(component.fromAddresses).toEqual([{ address: 'from-address', name: 'Sender' }])
    expect(component.toAddresses).toEqual([{ address: 'to-address', name: 'Recipient' }])
    expect(component.labeled).toEqual([['Memo', 'Invoice 42']])
  })

  it('keeps raw transaction data behind an operable toggle and copy action', () => {
    const clipboard = { copyAndShowToast: jasmine.createSpy('copyAndShowToast') }
    const component = new TransactionDetailsComponent(clipboard as any)
    component.transaction = { from: [], to: [], transactionDetails: { nonce: 1 } } as any
    component.ngOnChanges({} as any)

    component.toggleRawData()
    component.copyRawData()

    expect(component.displayRawData).toBeTrue()
    expect(clipboard.copyAndShowToast).toHaveBeenCalledWith(JSON.stringify({ nonce: 1 }))
  })
})
