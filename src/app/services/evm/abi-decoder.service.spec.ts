import { AbiDecoderService } from './abi-decoder.service'

describe('AbiDecoderService', () => {
  let decoder: AbiDecoderService

  beforeEach(() => {
    decoder = new AbiDecoderService()
  })

  it('extracts a 4-byte selector', () => {
    expect(decoder.extractSelector('0xa9059cbb000000')).toBe('a9059cbb')
  })

  it('returns null selector for short calldata', () => {
    expect(decoder.extractSelector('0x01')).toBeNull()
  })

  it('decodes transfer(address,uint256)', () => {
    const data =
      '0xa9059cbb' +
      '000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045' +
      '00000000000000000000000000000000000000000000000000000000000003e8'
    const r = decoder.decodeWithSignature(data, 'transfer(address,uint256)')
    expect(r).not.toBeNull()
    expect(r!.functionName).toBe('transfer')
    expect(r!.params.length).toBe(2)
    expect(r!.params[0].value.kind).toBe('address')
    if (r!.params[0].value.kind === 'address') {
      expect(r!.params[0].value.value).toBe('0xd8da6bf26964af9d7eed9e03e53415d37aa96045')
    }
    expect(r!.params[1].value.kind).toBe('uint')
    if (r!.params[1].value.kind === 'uint') {
      expect(r!.params[1].value.value).toBe(1000n)
    }
  })

  it('decodes approve(address,uint256) with max uint', () => {
    const data =
      '0x095ea7b3' +
      '0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d' +
      'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    const r = decoder.decodeWithSignature(data, 'approve(address,uint256)')
    expect(r).not.toBeNull()
    if (r!.params[1].value.kind === 'uint') {
      expect(r!.params[1].value.value).toBe((1n << 256n) - 1n)
    }
  })

  it('decodes transferFrom(address,address,uint256)', () => {
    const data =
      '0x23b872dd' +
      '000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
      '000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' +
      '000000000000000000000000000000000000000000000000000000000000002a'
    const r = decoder.decodeWithSignature(data, 'transferFrom(address,address,uint256)')
    expect(r).not.toBeNull()
    if (r!.params[2].value.kind === 'uint') {
      expect(r!.params[2].value.value).toBe(42n)
    }
  })

  it('decodes a function with a dynamic bytes parameter', () => {
    // foo(bytes) where bytes = 0xdeadbeef
    const data =
      '0x00000000' +
      '0000000000000000000000000000000000000000000000000000000000000020' +
      '0000000000000000000000000000000000000000000000000000000000000004' +
      'deadbeef00000000000000000000000000000000000000000000000000000000'
    const r = decoder.decodeWithSignature(data, 'foo(bytes)')
    expect(r).not.toBeNull()
    if (r!.params[0].value.kind === 'bytes') {
      expect(r!.params[0].value.hex).toBe('0xdeadbeef')
    }
  })

  it('decodes a function with a string parameter', () => {
    // foo(string) where string = "hi"
    const data =
      '0x00000000' +
      '0000000000000000000000000000000000000000000000000000000000000020' +
      '0000000000000000000000000000000000000000000000000000000000000002' +
      '6869000000000000000000000000000000000000000000000000000000000000'
    const r = decoder.decodeWithSignature(data, 'foo(string)')
    expect(r).not.toBeNull()
    if (r!.params[0].value.kind === 'string') {
      expect(r!.params[0].value.value).toBe('hi')
    }
  })

  it('decodes a tuple', () => {
    // foo((address,uint256)) where addr = 0xdead..., uint = 1
    const data =
      '0x00000000' +
      '000000000000000000000000deaddeaddeaddeaddeaddeaddeaddeaddeaddead' +
      '0000000000000000000000000000000000000000000000000000000000000001'
    const r = decoder.decodeWithSignature(data, 'foo((address,uint256))')
    expect(r).not.toBeNull()
    expect(r!.params[0].value.kind).toBe('tuple')
  })

  it('returns null for calldata shorter than 4 bytes', () => {
    expect(decoder.decodeWithSignature('0x01', 'foo()')).toBeNull()
  })

  it('returns null for unparseable signature', () => {
    expect(decoder.decodeWithSignature('0xa9059cbb', 'not a real signature')).toBeNull()
  })

  it('never throws', () => {
    expect(() => decoder.decodeWithSignature('garbage', 'foo()')).not.toThrow()
    expect(() => decoder.decodeWithSignature('0x', 'foo(uint256)')).not.toThrow()
  })

  describe('rejects non-canonical or out-of-bounds encodings', () => {
    const w = (hex: string) => hex.padStart(64, '0')

    it('rejects a bool with dirty high bytes', () => {
      expect(decoder.decodeWithSignature('0x12345678' + '01'.padEnd(64, '0'), 'f(bool)')).toBeNull()
      expect(decoder.decodeWithSignature('0x12345678' + w('02'), 'f(bool)')).toBeNull()
      expect(decoder.decodeWithSignature('0x12345678' + w('01'), 'f(bool)')).not.toBeNull()
    })

    it('rejects an address with dirty high bytes', () => {
      expect(decoder.decodeWithSignature('0x12345678' + 'ff' + w('d8da6bf26964af9d7eed9e03e53415d37aa96045').slice(2), 'f(address)')).toBeNull()
    })

    it('rejects uintN / intN values outside N bits', () => {
      expect(decoder.decodeWithSignature('0x12345678' + w('1ff'), 'f(uint8)')).toBeNull()
      expect(decoder.decodeWithSignature('0x12345678' + w('80'), 'f(int8)')).toBeNull()
      const minusOne = decoder.decodeWithSignature('0x12345678' + 'f'.repeat(64), 'f(int8)')
      const v = minusOne!.params[0].value
      expect(v.kind === 'int' && v.value).toBe(-1n)
    })

    it('rejects a bytes length beyond the calldata', () => {
      expect(decoder.decodeWithSignature('0x12345678' + w('20') + w('2710') + w('ab'), 'f(bytes)')).toBeNull()
    })

    it('rejects a huge array of zero-size elements without hanging', () => {
      expect(decoder.decodeWithSignature('0x12345678' + w('20') + w('ffffffffffff'), 'f(()[])')).toBeNull()
    })

    it('rejects misaligned or head-pointing offsets', () => {
      expect(decoder.decodeWithSignature('0x12345678' + w('21') + w('00'), 'f(bytes)')).toBeNull()
      expect(decoder.decodeWithSignature('0x12345678' + w('00') + w('00'), 'f(bytes)')).toBeNull()
    })

    it('rejects trailing data after the decoded extent', () => {
      expect(decoder.decodeWithSignature('0x12345678' + w('01') + w('02'), 'f(uint256)')).toBeNull()
    })
  })
})
