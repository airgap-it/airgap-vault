import { WalletStatusPipe } from './secret-filter.pipe'

describe('WalletFilterPipe', () => {
  it('create an instance', () => {
    const pipe = new WalletStatusPipe()
    expect(pipe).toBeTruthy()
  })
})
