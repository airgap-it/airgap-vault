import { FeeConverterPipe } from './fee-converter.pipe'

describe('FeeConverter Pipe', () => {
  let feeConverterPipe: FeeConverterPipe

  beforeEach(() => {
    feeConverterPipe = new FeeConverterPipe()
  })

  it('should display very small ETH number to a non-scientific string representation', () => {
    expect(feeConverterPipe.transform('1', { protocolIdentifier: 'eth' })).toEqual('0.000000000000000001 ETH')
  })

  it('should display a normal ETH number to a non-scientific string representation', () => {
    expect(feeConverterPipe.transform('1000000000000000000', { protocolIdentifier: 'eth' })).toEqual('1 ETH')
  })

  it('should display a big ETH number to a non-scientific string representation', () => {
    expect(feeConverterPipe.transform('10000000000000000000000000000000000', { protocolIdentifier: 'eth' })).toEqual(
      '10000000000000000 ETH'
    )
  })

  it('should return a valid amount if value is 0', () => {
    expect(feeConverterPipe.transform('0', { protocolIdentifier: 'eth' })).toEqual('0 ETH')
  })

  it('should return an empty string for non-numeric value', () => {
    expect(feeConverterPipe.transform('test', { protocolIdentifier: 'eth' })).toEqual('')
  })

  it('should return an empty string when protocolIdentifier is not set', () => {
    expect(feeConverterPipe.transform('1', { protocolIdentifier: undefined })).toEqual('')
  })

  it('should return an empty string when protocolIdentifier unknown', () => {
    expect(feeConverterPipe.transform('1', { protocolIdentifier: 'FeeConverterPipe' })).toEqual('')
  })

  function getTest(args) {
    it('Test with: ' + JSON.stringify(args), () => {
      expect(feeConverterPipe.transform(args.value, { protocolIdentifier: args.protocolIdentifier })).toEqual(args.expected)
    })
  }

  function makeTests(argsArray) {
    argsArray.forEach(v => {
      getTest(v)
    })
  }

  const truthyProtocolIdentifiers = [
    { value: '1', protocolIdentifier: 'btc', expected: '0.00000001 BTC' },
    { value: '1', protocolIdentifier: 'eth', expected: '0.000000000000000001 ETH' },
    { value: '1', protocolIdentifier: 'eth-erc20-ae', expected: '0.000000000000000001 ETH' }
  ]
  makeTests(truthyProtocolIdentifiers)

  const falsyValues = [
    { value: false, protocolIdentifier: 'eth', expected: '' },
    { value: 0, protocolIdentifier: 'eth', expected: '0 ETH' },
    { value: '', protocolIdentifier: 'eth', expected: '' },
    { value: null, protocolIdentifier: 'eth', expected: '' },
    { value: undefined, protocolIdentifier: 'eth', expected: '' },
    { value: NaN, protocolIdentifier: 'eth', expected: '' }
  ]
  makeTests(falsyValues)

  const falsyProtocolIdentifiers = [
    { value: '1', protocolIdentifier: false, expected: '' },
    { value: '1', protocolIdentifier: 0, expected: '' },
    { value: '1', protocolIdentifier: '', expected: '' },
    { value: '1', protocolIdentifier: null, expected: '' },
    { value: '1', protocolIdentifier: undefined, expected: '' },
    { value: '1', protocolIdentifier: NaN, expected: '' },
    { value: '1', protocolIdentifier: 'test', expected: '' },
    { value: '1', protocolIdentifier: 'asdf', expected: '' }
  ]
  makeTests(falsyProtocolIdentifiers)
})
