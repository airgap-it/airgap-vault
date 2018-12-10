import { AmountConverterPipe } from './amount-converter.pipe'
import { BigNumber } from 'bignumber.js'
const BN = BigNumber.clone({
  FORMAT: {
    decimalSeparator: `.`,
    groupSeparator: `'`,
    groupSize: 3
  }
})

describe('AmountConverter Pipe', () => {
  let amountConverterPipe: AmountConverterPipe

  beforeEach(() => {
    amountConverterPipe = new AmountConverterPipe()
  })

  describe('format number with commas', () => {
    it('should format short number', () => {
      expect(amountConverterPipe.formatBigNumber(new BN(`1`))).toEqual(`1`)
    })

    it('should add highcommas', () => {
      expect(amountConverterPipe.formatBigNumber(new BN(`1234567891`))).toEqual(`1'234'567'891`)
    })

    it('should should add highcommas only to first part of number', () => {
      expect(amountConverterPipe.formatBigNumber(new BN(`12345.67891`))).toEqual(`12'345.67891`)
    })

    it('should format long numbers', () => {
      expect(amountConverterPipe.formatBigNumber(new BN(`1234567891.1234567891`))).toEqual(`1'234'567'891.1234567891`)
    })

    it('should format short number if smaller than maxDigits', () => {
      expect(amountConverterPipe.formatBigNumber(new BN(`1`), 8)).toEqual(`1`)
    })

    it('should add "K" if number is too long', () => {
      expect(amountConverterPipe.formatBigNumber(new BN(`1234567891`), 8)).toEqual(`1'234'567K`)
    })

    it('should add "K" if number is too long and omit floating point', () => {
      expect(amountConverterPipe.formatBigNumber(new BN(`1234567891.1234567891`), 8)).toEqual(`1'234'567K`)
    })

    it('should format floating point part correctly', () => {
      expect(amountConverterPipe.formatBigNumber(new BN(`12345.67891`), 8)).toEqual(`12'345.679`)
    })

    it('should add "M" if number is too long', () => {
      expect(amountConverterPipe.formatBigNumber(new BN(`12345678912345`), 8)).toEqual(`12'345'678M`)
    })

    it('should add "M" if number is too long and omit floating point', () => {
      expect(amountConverterPipe.formatBigNumber(new BN(`12345678912345.000000000001`), 8)).toEqual(`12'345'678M`)
    })

    it('should limit long floating point', () => {
      expect(amountConverterPipe.formatBigNumber(new BN(`1.000000000001`), 8)).toEqual(`1`)
    })
  })

  describe('makeFullNumberSmaller', () => {
    it('should not make small number smaller', () => {
      expect(amountConverterPipe.makeFullNumberSmaller(new BN('1'), 3)).toEqual('1')
      expect(amountConverterPipe.makeFullNumberSmaller(new BN('12'), 3)).toEqual('12')
      expect(amountConverterPipe.makeFullNumberSmaller(new BN('123'), 3)).toEqual('123')
    })

    it('should make large number smaller', () => {
      expect(amountConverterPipe.makeFullNumberSmaller(new BN('1234'), 3)).toEqual('1K')
      expect(amountConverterPipe.makeFullNumberSmaller(new BN('12345'), 3)).toEqual('12K')
      expect(amountConverterPipe.makeFullNumberSmaller(new BN('123456'), 3)).toEqual('123K')
      expect(amountConverterPipe.makeFullNumberSmaller(new BN('1234567'), 3)).toEqual('1M')
      expect(amountConverterPipe.makeFullNumberSmaller(new BN('12345678'), 3)).toEqual('12M')
      expect(amountConverterPipe.makeFullNumberSmaller(new BN('123456789'), 3)).toEqual('123M')
      expect(amountConverterPipe.makeFullNumberSmaller(new BN('123456789123456789'), 3)).toEqual(`123'456'789'123M`)
    })
  })

  it('should display very small ETH number to a non-scientific string representation', () => {
    expect(amountConverterPipe.transform('1', { protocolIdentifier: 'eth', maxDigits: 0 })).toEqual('0.000000000000000001 ETH')
  })

  it('should display a normal ETH number to a non-scientific string representation', () => {
    expect(
      amountConverterPipe.transform('1000000000000000000', {
        protocolIdentifier: 'eth',
        maxDigits: 0
      })
    ).toEqual('1 ETH')
  })

  it('should display a big ETH number to a non-scientific string representation', () => {
    expect(
      amountConverterPipe.transform('10000000000000000000000000000000000', {
        protocolIdentifier: 'eth',
        maxDigits: 0
      })
    ).toEqual(`10'000'000'000'000'000 ETH`)
  })

  it('should return a valid amount if value is 0', () => {
    expect(amountConverterPipe.transform('0', { protocolIdentifier: 'eth', maxDigits: 0 })).toEqual('0 ETH')
  })

  it('should return an empty string when protocolIdentifier is not set', () => {
    expect(amountConverterPipe.transform('1', { protocolIdentifier: undefined, maxDigits: 0 })).toEqual('')
  })

  it('should handle values that are not a number', () => {
    expect(amountConverterPipe.transform('test', { protocolIdentifier: 'eth', maxDigits: 0 })).toEqual('')
  })

  it('should handle values that are undefined', () => {
    expect(amountConverterPipe.transform(undefined, { protocolIdentifier: 'eth', maxDigits: 0 })).toEqual('')
  })

  it('should handle values that are null', () => {
    expect(amountConverterPipe.transform(null, { protocolIdentifier: 'eth', maxDigits: 0 })).toEqual('')
  })

  it('should handle values that are empty object', () => {
    let value: any = {}
    expect(amountConverterPipe.transform(value, { protocolIdentifier: 'eth', maxDigits: 0 })).toEqual('')
  })

  function getTest(args) {
    it('Test with: ' + JSON.stringify(args), () => {
      expect(amountConverterPipe.transform(args.value, { protocolIdentifier: args.protocolIdentifier, maxDigits: 0 })).toEqual(
        args.expected
      )
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
    { value: '1', protocolIdentifier: 'eth-erc20-ae', expected: '0.000000000000000001 AE-ERC20' }
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
