import { DisplayRow } from '../../services/evm/abi-types'
import { EvmTransactionDisplayComponent } from './evm-transaction-display.component'

describe('EvmTransactionDisplayComponent — manual decimals selector', () => {
  let c: EvmTransactionDisplayComponent

  beforeEach(() => {
    // TranslateService is only used by the render* helpers; the decimals logic
    // does not touch it, so a minimal stub is enough.
    c = new EvmTransactionDisplayComponent({ instant: (k: string) => k } as any, {} as any)
  })

  const rawAmount = (): DisplayRow => ({ value: '1230000000000000000', type: 'amount', rawValue: '1230000000000000000' })

  it('offers the selector only on raw amount rows', () => {
    expect(c.isScalable(rawAmount())).toBe(true)
    expect(c.isScalable({ value: '1.23 USDC', type: 'amount' })).toBe(false) // already formatted via known-tokens
    expect(c.isScalable({ value: '0xabc', type: 'address' })).toBe(false)
  })

  it('defaults to raw with no scaled preview', () => {
    const r = rawAmount()
    expect(c.currentDecimals(r)).toBeNull()
    expect(c.scaledValue(r)).toBeNull()
  })

  it('cycles raw → 6 → 8 → 18 → raw and scales correctly', () => {
    const r = rawAmount()
    c.cycleDecimals(r)
    expect(c.currentDecimals(r)).toBe(6)
    expect(c.scaledValue(r)).toBe('1230000000000')
    c.cycleDecimals(r)
    expect(c.currentDecimals(r)).toBe(8)
    expect(c.scaledValue(r)).toBe('12300000000')
    c.cycleDecimals(r)
    expect(c.currentDecimals(r)).toBe(18)
    expect(c.scaledValue(r)).toBe('1.23')
    c.cycleDecimals(r)
    expect(c.currentDecimals(r)).toBeNull()
    expect(c.scaledValue(r)).toBeNull()
  })

  it('tracks the chosen scale independently per row', () => {
    const a = rawAmount()
    const b = rawAmount()
    c.cycleDecimals(a)
    expect(c.currentDecimals(a)).toBe(6)
    expect(c.currentDecimals(b)).toBeNull()
  })
})

describe('EvmTransactionDisplayComponent — expand / copy long values', () => {
  let c: EvmTransactionDisplayComponent
  let clipboard: jasmine.SpyObj<{ copyAndShowToast(text: string): Promise<void> }>

  beforeEach(() => {
    clipboard = jasmine.createSpyObj('ClipboardService', ['copyAndShowToast'])
    clipboard.copyAndShowToast.and.returnValue(Promise.resolve())
    c = new EvmTransactionDisplayComponent({ instant: (k: string) => k } as any, clipboard as any)
  })

  const hex = (): DisplayRow => ({ labelKey: 'evm-decoder.raw-calldata-label', value: '0x8d80ff0a' + 'ab'.repeat(300), type: 'hex' })

  it('offers expand/copy only on literal address and hex rows', () => {
    expect(c.isExpandable(hex())).toBe(true)
    expect(c.isExpandable({ value: '0x' + '11'.repeat(20), type: 'address' })).toBe(true)
    expect(c.isExpandable({ value: '', valueKey: 'evm-decoder.target-unknown', type: 'address' })).toBe(false)
    expect(c.isExpandable({ value: '1.23 USDC', type: 'amount' })).toBe(false)
    expect(c.isExpandable({ value: 'hello', type: 'text' })).toBe(false)
  })

  it('toggles the wrapped view independently per row', () => {
    const a = hex()
    const b = hex()
    c.toggleExpanded(a)
    expect(c.isExpanded(a)).toBe(true)
    expect(c.isExpanded(b)).toBe(false)
    c.toggleExpanded(a)
    expect(c.isExpanded(a)).toBe(false)
  })

  it('ignores toggles on rows that are not expandable', () => {
    const r: DisplayRow = { value: '1', type: 'amount' }
    c.toggleExpanded(r)
    expect(c.isExpanded(r)).toBe(false)
  })

  it('copies the full raw value', async () => {
    const r = hex()
    await c.copyValue(r)
    expect(clipboard.copyAndShowToast).toHaveBeenCalledWith(r.value)
  })
})
