import { AbiDecoderService } from '../../services/evm/abi-decoder.service'
import { DecodedParam, DisplayRow } from '../../services/evm/abi-types'

import { elementType, paramToRows } from './generic-abi.renderer'

/** Encode an unsigned integer as a 32-byte (64 hex char) ABI word. */
function uintWord(n: number): string {
  return n.toString(16).padStart(64, '0')
}

describe('generic-abi.renderer', () => {
  let decoder: AbiDecoderService

  beforeEach(() => {
    decoder = new AbiDecoderService()
  })

  function decodeParam(data: string, signature: string, index = 0): DecodedParam {
    const r = decoder.decodeWithSignature(data, signature)
    expect(r).not.toBeNull()
    return r!.params[index]
  }

  describe('elementType', () => {
    it('strips exactly one trailing array dimension', () => {
      expect(elementType('address[]')).toBe('address')
      expect(elementType('uint256[]')).toBe('uint256')
      expect(elementType('uint256[3]')).toBe('uint256')
      expect(elementType('uint256[][]')).toBe('uint256[]')
      expect(elementType('uint256[2][]')).toBe('uint256[2]')
      expect(elementType('(address,uint256)[]')).toBe('(address,uint256)')
    })

    it('returns the input unchanged when there is no array suffix', () => {
      expect(elementType('address')).toBe('address')
      expect(elementType('(address,uint256)')).toBe('(address,uint256)')
    })
  })

  describe('paramToRows — arrays (the multisend case)', () => {
    // f(address[],uint256[]) with addrs aaaa.., bbbb.. and amounts 1, 1000.
    // address[] block (len + 2 items = 3 words = 0x60) starts at 0x40, so uint256[] is at 0xa0.
    const data =
      '0x00000000' +
      '0000000000000000000000000000000000000000000000000000000000000040' + // offset address[] = 0x40
      '00000000000000000000000000000000000000000000000000000000000000a0' + // offset uint256[] = 0xa0
      '0000000000000000000000000000000000000000000000000000000000000002' + // address[] length = 2
      '000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' + // address[0]
      '000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' + // address[1]
      '0000000000000000000000000000000000000000000000000000000000000002' + // uint256[] length = 2
      '0000000000000000000000000000000000000000000000000000000000000001' + // uint256[0] = 1
      '00000000000000000000000000000000000000000000000000000000000003e8' //   uint256[1] = 1000
    const SIG = 'f(address[],uint256[])'

    it('expands an address[] into a header row plus one row per element', () => {
      const rows = paramToRows('arg0', decodeParam(data, SIG, 0))
      expect(rows.length).toBe(3)
      expect(rows[0]).toEqual(
        jasmine.objectContaining<DisplayRow>({
          label: 'arg0 (address[])',
          value: '2 items',
          valueKey: 'evm-decoder.array-items',
          valueParams: { count: 2 },
          type: 'text',
          depth: 0
        })
      )
      expect(rows[1]).toEqual(
        jasmine.objectContaining<DisplayRow>({
          label: 'arg0[0] (address)',
          value: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          type: 'address',
          depth: 1
        })
      )
      expect(rows[2]).toEqual(
        jasmine.objectContaining<DisplayRow>({
          label: 'arg0[1] (address)',
          value: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          type: 'address',
          depth: 1
        })
      )
    })

    it('expands a uint256[] with amount-typed element rows', () => {
      const rows = paramToRows('arg1', decodeParam(data, SIG, 1))
      expect(rows.length).toBe(3)
      expect(rows[0]).toEqual(
        jasmine.objectContaining<DisplayRow>({ label: 'arg1 (uint256[])', value: '2 items', type: 'text', depth: 0 })
      )
      expect(rows[1]).toEqual(jasmine.objectContaining<DisplayRow>({ label: 'arg1[0] (uint256)', value: '1', type: 'amount', depth: 1 }))
      expect(rows[2]).toEqual(jasmine.objectContaining<DisplayRow>({ label: 'arg1[1] (uint256)', value: '1000', type: 'amount', depth: 1 }))
    })
  })

  describe('paramToRows — tuples', () => {
    it('expands a tuple into a header row plus one row per field', () => {
      // g((address,uint256)) — static tuple, inlined (no offset word).
      const data =
        '0x00000000' +
        '000000000000000000000000cccccccccccccccccccccccccccccccccccccccc' + // tuple.0 address
        '000000000000000000000000000000000000000000000000000000000000002a' //   tuple.1 uint256 = 42
      const rows = paramToRows('arg0', decodeParam(data, 'g((address,uint256))'))
      expect(rows.length).toBe(3)
      expect(rows[0]).toEqual(
        jasmine.objectContaining<DisplayRow>({
          label: 'arg0 ((address,uint256))',
          value: '2 fields',
          valueKey: 'evm-decoder.tuple-fields',
          valueParams: { count: 2 },
          type: 'text',
          depth: 0
        })
      )
      expect(rows[1]).toEqual(
        jasmine.objectContaining<DisplayRow>({
          label: 'arg0[0] (address)',
          value: '0xcccccccccccccccccccccccccccccccccccccccc',
          type: 'address',
          depth: 1
        })
      )
      expect(rows[2]).toEqual(jasmine.objectContaining<DisplayRow>({ label: 'arg0[1] (uint256)', value: '42', type: 'amount', depth: 1 }))
    })

    it('renders an array of tuples nested three levels deep', () => {
      // h((address,uint256)[]) with one tuple (dddd.., 7).
      const data =
        '0x00000000' +
        '0000000000000000000000000000000000000000000000000000000000000020' + // offset to array = 0x20
        '0000000000000000000000000000000000000000000000000000000000000001' + // array length = 1
        '000000000000000000000000dddddddddddddddddddddddddddddddddddddddd' + // tuple[0].address
        '0000000000000000000000000000000000000000000000000000000000000007' //   tuple[0].uint256 = 7
      const rows = paramToRows('arg0', decodeParam(data, 'h((address,uint256)[])'))
      expect(rows.length).toBe(4)
      expect(rows[0]).toEqual(
        jasmine.objectContaining<DisplayRow>({ label: 'arg0 ((address,uint256)[])', value: '1 items', type: 'text', depth: 0 })
      )
      expect(rows[1]).toEqual(
        jasmine.objectContaining<DisplayRow>({ label: 'arg0[0] ((address,uint256))', value: '2 fields', type: 'text', depth: 1 })
      )
      expect(rows[2]).toEqual(
        jasmine.objectContaining<DisplayRow>({
          label: 'arg0[0][0] (address)',
          value: '0xdddddddddddddddddddddddddddddddddddddddd',
          type: 'address',
          depth: 2
        })
      )
      expect(rows[3]).toEqual(jasmine.objectContaining<DisplayRow>({ label: 'arg0[0][1] (uint256)', value: '7', type: 'amount', depth: 2 }))
    })
  })

  describe('paramToRows — edge cases', () => {
    it('renders an empty array as a single "0 items" header with no element rows', () => {
      const data =
        '0x00000000' +
        '0000000000000000000000000000000000000000000000000000000000000020' + // offset to array = 0x20
        '0000000000000000000000000000000000000000000000000000000000000000' //   array length = 0
      const rows = paramToRows('arg0', decodeParam(data, 'f(uint256[])'))
      expect(rows.length).toBe(1)
      expect(rows[0]).toEqual(
        jasmine.objectContaining<DisplayRow>({ value: '0 items', valueKey: 'evm-decoder.array-items', valueParams: { count: 0 }, depth: 0 })
      )
    })

    it('caps long arrays at 50 elements and appends a truncation row', () => {
      const count = 51
      let data = '0x00000000' + uintWord(0x20) + uintWord(count)
      for (let i = 0; i < count; i++) data += uintWord(i)
      const rows = paramToRows('arg0', decodeParam(data, 'f(uint256[])'))

      // 1 header + 50 element rows + 1 truncation row
      expect(rows.length).toBe(52)
      expect(rows[0]).toEqual(jasmine.objectContaining<DisplayRow>({ value: '51 items', valueParams: { count: 51 }, depth: 0 }))
      expect(rows.filter((r) => r.type === 'amount').length).toBe(50)
      expect(rows[51]).toEqual(
        jasmine.objectContaining<DisplayRow>({
          value: '… and 1 more',
          valueKey: 'evm-decoder.array-truncated',
          valueParams: { count: 1 },
          type: 'text',
          depth: 1
        })
      )
    })

    it('does not flatten a single-element array', () => {
      const data = '0x00000000' + uintWord(0x20) + uintWord(1) + uintWord(99)
      const rows = paramToRows('arg0', decodeParam(data, 'f(uint256[])'))
      expect(rows.length).toBe(2)
      expect(rows[0]).toEqual(jasmine.objectContaining<DisplayRow>({ value: '1 items', depth: 0 }))
      expect(rows[1]).toEqual(jasmine.objectContaining<DisplayRow>({ label: 'arg0[0] (uint256)', value: '99', type: 'amount', depth: 1 }))
    })
  })
})
