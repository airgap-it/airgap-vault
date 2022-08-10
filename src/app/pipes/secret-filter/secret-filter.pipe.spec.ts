import { SecretFilterPipe } from './secret-filter.pipe'

describe('SecretFilterPipe', () => {
  it('create an instance', () => {
    const pipe = new SecretFilterPipe()
    expect(pipe).toBeTruthy()
  })
})
