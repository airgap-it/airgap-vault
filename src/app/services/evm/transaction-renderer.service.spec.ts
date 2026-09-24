import { AbiDecoderService } from './abi-decoder.service'
import { SignatureDatabaseService } from './signature-database.service'
import { EvmTransactionRendererService } from './transaction-renderer.service'

class FakeDb {
  private map = new Map<string, { sig: string; collisions: number }>()
  set(sel: string, sig: string, collisions = 1) {
    this.map.set(sel.toLowerCase(), { sig, collisions })
  }
  async initialize() {}
  async lookup(sel: string) {
    const e = this.map.get(sel.toLowerCase())
    return e ? { signature: e.sig, selector: sel.toLowerCase(), collisions: e.collisions } : null
  }
  async getMetadata() {
    return null
  }
}

/** Left-pad a hex string to a 32-byte ABI word. */
function word(hex: string): string {
  return hex.replace(/^0x/, '').toLowerCase().padStart(64, '0')
}

/** Right-pad hex to a whole number of 32-byte words (ABI dynamic-data padding). */
function pad32(hex: string): string {
  return hex + '0'.repeat((64 - (hex.length % 64)) % 64)
}

// foo(uint256)=7 — stands in for an arbitrary wrapped call (e.g. Gnosis setup(...)).
const INNER_FOO = '22222222' + word('7')

// createProxyWithNonce(address singleton, bytes initializer, uint256 saltNonce),
// initializer = INNER_FOO.
const PROXY_DATA =
  '0x1688f0b9' + word('1111111111111111111111111111111111111111') + word('60') + word('2a') + word('24') + pad32(INNER_FOO)

describe('EvmTransactionRendererService', () => {
  let svc: EvmTransactionRendererService
  let db: FakeDb

  beforeEach(() => {
    db = new FakeDb()
    svc = new EvmTransactionRendererService(new AbiDecoderService(), db as unknown as SignatureDatabaseService)
  })

  it('routes ERC-20 transfer to dedicated renderer', async () => {
    const tx = {
      to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      data:
        '0xa9059cbb' +
        '000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045' +
        '00000000000000000000000000000000000000000000000000000000000003e8',
      chainId: 1
    }
    await svc.prepare(tx)
    const r = svc.render(tx)
    expect(r.type).toBe('erc20-transfer')
    expect(r.confidence).toBe('high')
  })

  it('routes unknown calldata to raw-hex with unknown confidence', async () => {
    const tx = { to: '0xdead000000000000000000000000000000000000', data: '0xdeadbeef00' }
    await svc.prepare(tx)
    const r = svc.render(tx)
    expect(r.type).toBe('raw-hex')
    expect(r.confidence).toBe('unknown')
  })

  it('uses database for non-dedicated selector', async () => {
    db.set('11111111', 'foo(uint256)')
    const tx = {
      to: '0xabc0000000000000000000000000000000000000',
      data: '0x11111111' + '0000000000000000000000000000000000000000000000000000000000000007'
    }
    await svc.prepare(tx)
    const r = svc.render(tx)
    expect(r.type).toBe('generic-decoded')
    expect(r.confidence).toBe('medium')
  })

  it('flags transferFrom as ambiguous (low confidence)', async () => {
    const tx = {
      to: '0xabc0000000000000000000000000000000000000',
      data:
        '0x23b872dd' +
        '000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
        '000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' +
        '000000000000000000000000000000000000000000000000000000000000002a'
    }
    await svc.prepare(tx)
    const r = svc.render(tx)
    expect(r.type).toBe('erc721-transfer')
    expect(r.confidence).toBe('low')
    expect(r.warningKey).toBeTruthy()
  })

  it('decodes multicall and renders inner calls', async () => {
    // multicall(bytes[]) with two ERC-20 transfers
    const inner =
      'a9059cbb' +
      '000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045' +
      '0000000000000000000000000000000000000000000000000000000000000001'
    // bytes[] with 2 entries each containing 68 (0x44) bytes
    // 68 % 32 = 4, so pad each blob with 28 zero bytes = 56 hex chars
    const pad = '0'.repeat(56)
    const data =
      '0xac9650d8' +
      '0000000000000000000000000000000000000000000000000000000000000020' + // offset to array
      '0000000000000000000000000000000000000000000000000000000000000002' + // length
      '0000000000000000000000000000000000000000000000000000000000000040' + // offset to elem 0
      '00000000000000000000000000000000000000000000000000000000000000c0' + // offset to elem 1
      '0000000000000000000000000000000000000000000000000000000000000044' + // elem 0 length
      inner +
      pad +
      '0000000000000000000000000000000000000000000000000000000000000044' + // elem 1 length
      inner +
      pad
    const tx = { to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', data, chainId: 1 }
    await svc.prepare(tx)
    const r = svc.render(tx)
    expect(r.type).toBe('multicall')
    expect(r.nested?.length).toBe(2)
    expect(r.nested?.[0].type).toBe('erc20-transfer')
  })

  it('annotates address rows with curated well-known names', async () => {
    // transfer(0xd8da…, 1000) sent to the USDC contract on Ethereum
    const tx = {
      to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      data:
        '0xa9059cbb' +
        '000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045' +
        '00000000000000000000000000000000000000000000000000000000000003e8',
      chainId: 1
    }
    await svc.prepare(tx)
    const r = svc.render(tx)
    const named = r.rows.find((row) => row.type === 'address' && row.addressName === 'USDC')
    expect(named).toBeTruthy()
    expect(named!.value.toLowerCase()).toBe('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
  })

  it('recursively decodes calldata embedded in a bytes parameter (Gnosis createProxyWithNonce → setup pattern)', async () => {
    db.set('1688f0b9', 'createProxyWithNonce(address,bytes,uint256)')
    db.set('22222222', 'foo(uint256)')
    const tx = { to: '0xcccccccccccccccccccccccccccccccccccccccc', data: PROXY_DATA, chainId: 1 }
    await svc.prepare(tx)
    const r = svc.render(tx)
    expect(r.type).toBe('generic-decoded')
    expect(r.nested?.length).toBe(1)
    expect(r.nested?.[0].type).toBe('generic-decoded')
    expect(r.nested?.[0].functionName).toContain('foo')
    // the wrapped bytes param is shown as a pointer to the nested decode, not raw hex
    expect(r.rows.some((row) => row.valueKey === 'evm-decoder.bytes-decoded-below')).toBe(true)
  })

  it('never attributes a bytes-wrapped call to the outer contract', async () => {
    db.set('1688f0b9', 'createProxyWithNonce(address,bytes,uint256)')
    db.set('22222222', 'foo(uint256)')
    const outer = '0xcccccccccccccccccccccccccccccccccccccccc'
    const tx = { to: outer, data: PROXY_DATA, chainId: 1 }
    await svc.prepare(tx)
    const inner = svc.render(tx).nested?.[0]
    expect(inner).toBeTruthy()
    // The initializer executes on the proxy the factory creates, never on the factory.
    expect(inner!.rows.some((row) => row.value.toLowerCase() === outer)).toBe(false)
    const contract = inner!.rows.find((row) => row.labelKey === 'evm-decoder.contract-label')
    expect(contract?.valueKey).toBe('evm-decoder.target-unknown')
    expect(contract?.type).toBe('warning')
    expect(inner!.targetUnknown).toBe(true)
  })

  it('does not denominate a bytes-wrapped amount in the outer contract token', async () => {
    // wrap(bytes) on the USDC contract, wrapping transfer(0xd8da…, 10^18).
    const transfer = 'a9059cbb' + word('d8da6bf26964af9d7eed9e03e53415d37aa96045') + word((10n ** 18n).toString(16))
    const data = '0x66666666' + word('20') + word('44') + pad32(transfer)
    db.set('66666666', 'wrap(bytes)')
    const usdc = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    const tx = { to: usdc, data, chainId: 1 }
    await svc.prepare(tx)
    const inner = svc.render(tx).nested?.[0]
    expect(inner?.type).toBe('erc20-transfer')
    const amount = inner!.rows.find((row) => row.labelKey === 'evm-decoder.amount-label')
    // 10^18 base units must stay raw — formatting it with USDC's 6 decimals would
    // read "1000000000000 USDC" for a token the inner call may have nothing to do with.
    expect(amount?.value).toBe((10n ** 18n).toString())
    expect(amount?.rawValue).toBe((10n ** 18n).toString())
    expect(amount?.valueKey).toBe('evm-decoder.amount-raw-note')
    // and the outer USDC address must not be repeated as the inner contract
    expect(inner!.rows.some((row) => row.value.toLowerCase() === usdc)).toBe(false)
  })

  it('propagates unknown-target through a multicall recovered from a bytes parameter', async () => {
    const innerTransfer = 'a9059cbb' + word('d8da6bf26964af9d7eed9e03e53415d37aa96045') + word('1')
    const multicall = 'ac9650d8' + word('20') + word('1') + word('20') + word('44') + pad32(innerTransfer)
    const data = '0x66666666' + word('20') + word((multicall.length / 2).toString(16)) + pad32(multicall)
    db.set('66666666', 'wrap(bytes)')
    const tx = { to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', data, chainId: 1 }
    await svc.prepare(tx)
    const nestedMulticall = svc.render(tx).nested?.[0]
    expect(nestedMulticall?.type).toBe('multicall')
    expect(nestedMulticall?.targetUnknown).toBe(true)
    // a multicall self-delegates, so its children inherit the same unknown target
    expect(nestedMulticall?.nested?.[0].targetUnknown).toBe(true)
  })

  it('keeps the real target on a top-level call and its multicall children', async () => {
    const innerTransfer = 'a9059cbb' + word('d8da6bf26964af9d7eed9e03e53415d37aa96045') + word('1')
    const usdc = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    const data = '0xac9650d8' + word('20') + word('1') + word('20') + word('44') + pad32(innerTransfer)
    const tx = { to: usdc, data, chainId: 1 }
    await svc.prepare(tx)
    const r = svc.render(tx)
    expect(r.targetUnknown).toBeUndefined()
    expect(r.nested?.[0].targetUnknown).toBeUndefined()
    const contract = r.nested?.[0].rows.find((row) => row.labelKey === 'evm-decoder.contract-label')
    expect(contract?.value.toLowerCase()).toBe(usdc)
    // known token on a known target still formats normally
    const amount = r.nested?.[0].rows.find((row) => row.labelKey === 'evm-decoder.amount-label')
    expect(amount?.value).toBe('0.000001 USDC')
  })

  it('leaves a blocklisted 0x00000000 bytes parameter as raw hex (Gnosis execTransaction pattern)', async () => {
    // wrap2(bytes a, bytes b): a = decodable foo(...), b = 0x00000000… (must stay raw)
    const blocked = '00000000' + word('0')
    const data =
      '0x33333333' +
      word('40') +
      word('a0') +
      word('24') +
      pad32(INNER_FOO) +
      word('24') +
      pad32(blocked)
    db.set('33333333', 'wrap2(bytes,bytes)')
    db.set('22222222', 'foo(uint256)')
    const tx = { to: '0xdddddddddddddddddddddddddddddddddddddddd', data }
    await svc.prepare(tx)
    const r = svc.render(tx)
    expect(r.nested?.length).toBe(1) // only the decodable bytes, not the 0x00000000 one
    const blockedRow = r.rows.find((row) => typeof row.value === 'string' && row.value.startsWith('0x00000000'))
    expect(blockedRow?.type).toBe('hex')
    expect(r.nested?.some((n) => n.rawCalldata.startsWith('0x00000000'))).toBe(false)
  })

  it('caps a nested decode confidence at its container', async () => {
    db.set('1688f0b9', 'createProxyWithNonce(address,bytes,uint256)', 3) // ambiguous → low
    db.set('22222222', 'foo(uint256)', 1) // would be medium on its own
    const tx = { to: '0xcccccccccccccccccccccccccccccccccccccccc', data: PROXY_DATA }
    await svc.prepare(tx)
    const r = svc.render(tx)
    expect(r.confidence).toBe('low')
    expect(r.nested?.[0].confidence).toBe('low')
  })

  it('decodes embedded calldata nested two levels deep (iterative prefetch)', async () => {
    const wrapB = '0x44444444' + word('20') + word('24') + pad32(INNER_FOO)
    const wrapBbody = wrapB.slice(2)
    const wrapA = '0x55555555' + word('20') + word((wrapBbody.length / 2).toString(16)) + pad32(wrapBbody)
    db.set('55555555', 'wrapA(bytes)')
    db.set('44444444', 'wrapB(bytes)')
    db.set('22222222', 'foo(uint256)')
    const tx = { to: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', data: wrapA }
    await svc.prepare(tx)
    const r = svc.render(tx)
    expect(r.nested?.length).toBe(1)
    expect(r.nested?.[0].nested?.length).toBe(1)
    expect(r.nested?.[0].nested?.[0].functionName).toContain('foo')
  })

  it('never decodes the blocklisted 0x00000000 selector, even when the DB has a (scam) entry', async () => {
    db.set('00000000', 'ROOT4146650865()', 30) // classic selector-squatting entry on Sourcify
    const tx = { to: '0xabc0000000000000000000000000000000000000', data: '0x00000000' + word('1') }
    await svc.prepare(tx)
    const r = svc.render(tx)
    expect(r.type).toBe('raw-hex')
    expect(r.confidence).toBe('unknown')
  })

  it('never decodes the blocklisted 0xffffffff selector', async () => {
    db.set('ffffffff', 'LOCK8605463013()')
    const tx = { to: '0xabc0000000000000000000000000000000000000', data: '0xffffffff' + word('1') }
    await svc.prepare(tx)
    const r = svc.render(tx)
    expect(r.type).toBe('raw-hex')
    expect(r.confidence).toBe('unknown')
  })

  it('decodes 0x1f931c1c as diamondCut via the generic path, not as multicall', async () => {
    // diamondCut(FacetCut[] (empty), address 0, bytes (empty))
    const data = '0x1f931c1c' + word('60') + word('0') + word('80') + word('0') + word('0')
    db.set('1f931c1c', 'diamondCut((address,uint8,bytes4[])[],address,bytes)')
    const tx = { to: '0xddddddddddddddddddddddddddddddddddddddd0', data }
    await svc.prepare(tx)
    const r = svc.render(tx)
    expect(r.type).toBe('generic-decoded')
    expect(r.functionName).toContain('diamondCut')
  })

  it('routes multicall(bytes32,bytes[]) (0x1f0464d1) to the dedicated multicall renderer with nested calls', async () => {
    const erc20 =
      'a9059cbb' +
      '000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045' +
      '0000000000000000000000000000000000000000000000000000000000000001'
    const pad = '0'.repeat(56)
    const data =
      '0x1f0464d1' +
      word('aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899') + // bytes32 previousBlockhash
      word('40') + // offset to bytes[]
      word('2') +
      word('40') +
      word('c0') +
      word('44') +
      erc20 +
      pad +
      word('44') +
      erc20 +
      pad
    const tx = { to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', data, chainId: 1 }
    await svc.prepare(tx)
    const r = svc.render(tx)
    expect(r.type).toBe('multicall')
    expect(r.nested?.length).toBe(2)
    expect(r.nested?.[0].type).toBe('erc20-transfer')
  })
})
