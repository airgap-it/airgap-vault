import { FeeConverterPipe } from './fee-converter.pipe'

import { MainProtocolSymbols } from 'airgap-coin-lib/dist/utils/ProtocolSymbols'

describe('FeeConverter Pipe', () => {
  let feeConverterPipe: FeeConverterPipe

  beforeEach(() => {
    localStorage.clear()
    feeConverterPipe = new FeeConverterPipe()
  })

  it('should display very small ETH number to a non-scientific string representation', () => {
    expect(feeConverterPipe.transform('1', { protocolIdentifier: MainProtocolSymbols.ETH })).toEqual('0.000000000000000001 ETH')
  })

  it('should display a normal ETH number to a non-scientific string representation', () => {
    expect(feeConverterPipe.transform('1000000000000000000', { protocolIdentifier: MainProtocolSymbols.ETH })).toEqual('1 ETH')
  })

  it('should display a big ETH number to a non-scientific string representation', () => {
    expect(feeConverterPipe.transform('10000000000000000000000000000000000', { protocolIdentifier: MainProtocolSymbols.ETH })).toEqual(
      '10000000000000000 ETH'
    )
  })

  it('should return a valid amount if value is 0', () => {
    expect(feeConverterPipe.transform('0', { protocolIdentifier: MainProtocolSymbols.ETH })).toEqual('0 ETH')
  })

  it('should return an empty string for non-numeric value', () => {
    expect(feeConverterPipe.transform('test', { protocolIdentifier: MainProtocolSymbols.ETH })).toEqual('')
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
    argsArray.forEach((v) => {
      getTest(v)
    })
  }

  const truthyProtocolIdentifiers = [
    { value: '1', protocolIdentifier: MainProtocolSymbols.BTC, expected: '0.00000001 BTC' },
    { value: '1', protocolIdentifier: MainProtocolSymbols.ETH, expected: '0.000000000000000001 ETH' }
  ]
  makeTests(truthyProtocolIdentifiers)

  const falsyValues = [
    { value: false, protocolIdentifier: MainProtocolSymbols.ETH, expected: '' },
    { value: 0, protocolIdentifier: MainProtocolSymbols.ETH, expected: '0 ETH' },
    { value: '', protocolIdentifier: MainProtocolSymbols.ETH, expected: '' },
    { value: null, protocolIdentifier: MainProtocolSymbols.ETH, expected: '' },
    { value: undefined, protocolIdentifier: MainProtocolSymbols.ETH, expected: '' },
    { value: NaN, protocolIdentifier: MainProtocolSymbols.ETH, expected: '' }
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
