#!/usr/bin/env node
// Renderer pipeline smoke test. Compiles the renderer + service files via tsc
// against a minimal angular stub, then exercises the pipeline.

import { execSync } from 'child_process'
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, statSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const tmp = mkdtempSync(join(tmpdir(), 'agv-rsmoke-'))
const projRoot = join(import.meta.dirname, '..')

const files = [
  'src/app/services/evm/abi-decoder.service.ts',
  'src/app/services/evm/abi-types.ts',
  'src/app/services/evm/known-tokens.ts',
  'src/app/services/evm/signature-database.service.ts',
  'src/app/services/evm/transaction-renderer.service.ts',
  'src/app/renderers/evm/base.renderer.ts',
  'src/app/renderers/evm/erc20.renderer.ts',
  'src/app/renderers/evm/erc721.renderer.ts',
  'src/app/renderers/evm/multicall.renderer.ts',
  'src/app/renderers/evm/generic-abi.renderer.ts',
  'src/app/renderers/evm/raw-hex.renderer.ts',
  'scripts/stubs/angular-core.ts',
  'scripts/stubs/angular-common-http.ts',
  'scripts/stubs/rxjs.ts'
].map(f => join(projRoot, f))

const tsconfig = {
  compilerOptions: {
    target: 'ES2020',
    module: 'ESNext',
    moduleResolution: 'node',
    strict: false,
    experimentalDecorators: true,
    skipLibCheck: true,
    esModuleInterop: true,
    outDir: tmp,
    rootDir: projRoot
  },
  files,
  include: []
}
writeFileSync(join(tmp, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2))
execSync(`npx tsc -p "${join(tmp, 'tsconfig.json')}"`, { cwd: projRoot, stdio: 'inherit' })

// Write tmp ESM stubs and rewrite bare-specifier imports in emitted JS to point at them.
const stubFiles = {
  'angular-core.js': 'export const Injectable = () => (_) => {}\n',
  'angular-common-http.js': 'export class HttpClient { get(_a, _b) { return null } }\n',
  'rxjs.js': 'export function firstValueFrom(_x) { return Promise.reject(new Error("no http")) }\n'
}
for (const [name, src] of Object.entries(stubFiles)) writeFileSync(join(tmp, name), src)
const stubMap = {
  '@angular/core': `${tmp}/angular-core.js`,
  '@angular/common/http': `${tmp}/angular-common-http.js`,
  rxjs: `${tmp}/rxjs.js`
}
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full)
    else if (full.endsWith('.js')) {
      let src = readFileSync(full, 'utf8')
      let changed = false
      // Add .js to extensionless relative imports for ESM
      const before = src
      src = src.replace(/from ['"](\.[^'"]+)['"]/g, (_m, p) => {
        if (/\.(js|mjs|cjs|json)$/.test(p)) return `from "${p}"`
        return `from "${p}.js"`
      })
      if (src !== before) changed = true
      for (const [k, v] of Object.entries(stubMap)) {
        const re = new RegExp(`from ['"]${k.replace(/[/.]/g, '\\$&')}['"]`, 'g')
        if (re.test(src)) {
          src = src.replace(re, `from "${v.replace(/\\/g, '/')}"`)
          changed = true
        }
      }
      if (changed) writeFileSync(full, src)
    }
  }
}
walk(tmp)

const { AbiDecoderService } = await import(`file://${tmp}/src/app/services/evm/abi-decoder.service.js`)
const { EvmTransactionRendererService } = await import(
  `file://${tmp}/src/app/services/evm/transaction-renderer.service.js`
)

class FakeDb {
  map = new Map()
  set(s, sig, c = 1) {
    this.map.set(s.toLowerCase(), { signature: sig, collisions: c })
  }
  async initialize() {}
  async lookup(s) {
    const v = this.map.get(s.toLowerCase())
    return v ? { signature: v.signature, selector: s.toLowerCase(), collisions: v.collisions } : null
  }
  async getMetadata() {
    return null
  }
}

let pass = 0
let fail = 0
function check(name, cond, detail) {
  if (cond) {
    console.log('  PASS', name)
    pass++
  } else {
    console.error('  FAIL', name, detail || '')
    fail++
  }
}

const dec = new AbiDecoderService()
const db = new FakeDb()
const svc = new EvmTransactionRendererService(dec, db)

console.log('Renderer pipeline')

// 1. ERC-20 transfer routed to dedicated renderer
{
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
  check('erc20 routed', r.type === 'erc20-transfer' && r.confidence === 'high', JSON.stringify(r))
}

// 2. transferFrom -> low confidence with warning
{
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
  check('transferFrom ambiguous', r.type === 'erc721-transfer' && r.confidence === 'low' && !!r.warningKey)
}

// 3. Unknown -> raw hex
{
  const tx = { to: '0xdead000000000000000000000000000000000000', data: '0xdeadbeef00' }
  await svc.prepare(tx)
  const r = svc.render(tx)
  check('unknown -> raw-hex', r.type === 'raw-hex' && r.confidence === 'unknown')
}

// 4. Generic DB match with collisions
{
  db.set('11111111', 'foo(uint256)', 3)
  const tx = {
    to: '0xabc0000000000000000000000000000000000000',
    data: '0x11111111' + '0000000000000000000000000000000000000000000000000000000000000007'
  }
  await svc.prepare(tx)
  const r = svc.render(tx)
  check('generic with collisions -> low', r.type === 'generic-decoded' && r.confidence === 'low')
}

// 5. Multicall with two ERC-20 transfers
{
  const inner =
    'a9059cbb' +
    '000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045' +
    '0000000000000000000000000000000000000000000000000000000000000001'
  const pad = '0'.repeat(56) // 68-byte blob padded to 96
  const data =
    '0xac9650d8' +
    '0000000000000000000000000000000000000000000000000000000000000020' +
    '0000000000000000000000000000000000000000000000000000000000000002' +
    '0000000000000000000000000000000000000000000000000000000000000040' +
    '00000000000000000000000000000000000000000000000000000000000000c0' +
    '0000000000000000000000000000000000000000000000000000000000000044' +
    inner +
    pad +
    '0000000000000000000000000000000000000000000000000000000000000044' +
    inner +
    pad
  const tx = { to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', data, chainId: 1 }
  await svc.prepare(tx)
  const r = svc.render(tx)
  check(
    'multicall decoded',
    r.type === 'multicall' && r.nested?.length === 2 && r.nested[0].type === 'erc20-transfer',
    JSON.stringify({ type: r.type, nested: r.nested?.length, inner0: r.nested?.[0]?.type })
  )
}

// 6. Depth-3 cap: a multicall that contains a multicall, recursed past the cap,
//    must surface a depth-warning result rather than infinite recursion.
{
  // Build a 1-call multicall whose single inner blob is the SAME multicall.
  // Wrapping it 4 deep means at least one level hits the cap.
  function wrapMulticall(innerHex) {
    const innerBytes = innerHex.replace(/^0x/, '')
    const byteLen = innerBytes.length / 2
    const padLen = (32 - (byteLen % 32)) % 32
    const pad = '0'.repeat(padLen * 2)
    const lenWord = byteLen.toString(16).padStart(64, '0')
    return (
      '0xac9650d8' +
      '0000000000000000000000000000000000000000000000000000000000000020' +
      '0000000000000000000000000000000000000000000000000000000000000001' +
      '0000000000000000000000000000000000000000000000000000000000000020' +
      lenWord +
      innerBytes +
      pad
    )
  }
  let payload = '0xfeedface00112233'
  for (let i = 0; i < 4; i++) payload = wrapMulticall(payload)
  const tx = { to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', data: payload, chainId: 1 }
  await svc.prepare(tx)
  const r = svc.render(tx)
  // walk down, ensure no infinite recursion and we eventually reach a depth-cap result
  let cur = r
  let depthSeen = 0
  let hitDepthCap = false
  while (cur && cur.type === 'multicall') {
    if (cur.warningKey === 'evm-decoder.multicall-depth-warning') {
      hitDepthCap = true
      break
    }
    depthSeen++
    cur = cur.nested?.[0]
    if (depthSeen > 10) break
  }
  check('depth cap reached without infinite recursion', hitDepthCap, `depthSeen=${depthSeen}`)
}

// 7. Calldata recovered from a bytes parameter must not be attributed to the
//    outer contract: no inherited address, no outer-token denomination.
{
  const w = hex => hex.replace(/^0x/, '').toLowerCase().padStart(64, '0')
  const p32 = hex => hex + '0'.repeat((64 - (hex.length % 64)) % 64)
  const transfer = 'a9059cbb' + w('d8da6bf26964af9d7eed9e03e53415d37aa96045') + w((10n ** 18n).toString(16))
  const data = '0x66666666' + w('20') + w('44') + p32(transfer)
  db.set('66666666', 'wrap(bytes)')
  const usdc = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
  const tx = { to: usdc, data, chainId: 1 }
  await svc.prepare(tx)
  const r = svc.render(tx)
  const inner = r.nested?.[0]
  const contract = inner?.rows.find(row => row.labelKey === 'evm-decoder.contract-label')
  const amount = inner?.rows.find(row => row.labelKey === 'evm-decoder.amount-label')
  check(
    'bytes-wrapped call does not inherit the outer target',
    inner?.type === 'erc20-transfer' &&
      inner.targetUnknown === true &&
      contract?.valueKey === 'evm-decoder.target-unknown' &&
      !inner.rows.some(row => row.value.toLowerCase() === usdc),
    JSON.stringify({ type: inner?.type, targetUnknown: inner?.targetUnknown, contract })
  )
  check(
    'bytes-wrapped amount stays raw (not denominated in the outer token)',
    amount?.value === (10n ** 18n).toString() && amount?.rawValue === (10n ** 18n).toString(),
    JSON.stringify(amount)
  )
  // Sanity: the same transfer sent directly to USDC still formats as USDC.
  const direct = { to: usdc, data: '0x' + transfer, chainId: 1 }
  await svc.prepare(direct)
  const dr = svc.render(direct)
  const directAmount = dr.rows.find(row => row.labelKey === 'evm-decoder.amount-label')
  check(
    'a direct call to a known token still formats its amount',
    dr.targetUnknown === undefined && directAmount?.value === '1000000000000 USDC',
    JSON.stringify({ targetUnknown: dr.targetUnknown, amount: directAmount })
  )
}

// 8. A multicall recovered from a bytes parameter self-delegates to an unknown
//    target, so the whole subtree below it must stay flagged.
{
  const w = hex => hex.replace(/^0x/, '').toLowerCase().padStart(64, '0')
  const p32 = hex => hex + '0'.repeat((64 - (hex.length % 64)) % 64)
  const transfer = 'a9059cbb' + w('d8da6bf26964af9d7eed9e03e53415d37aa96045') + w('1')
  const multicall = 'ac9650d8' + w('20') + w('1') + w('20') + w('44') + p32(transfer)
  const data = '0x66666666' + w('20') + w((multicall.length / 2).toString(16)) + p32(multicall)
  db.set('66666666', 'wrap(bytes)')
  const tx = { to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', data, chainId: 1 }
  await svc.prepare(tx)
  const nestedMulticall = svc.render(tx).nested?.[0]
  check(
    'unknown target propagates through a nested multicall',
    nestedMulticall?.type === 'multicall' &&
      nestedMulticall.targetUnknown === true &&
      nestedMulticall.nested?.[0]?.targetUnknown === true,
    JSON.stringify({ type: nestedMulticall?.type, flag: nestedMulticall?.targetUnknown, innerFlag: nestedMulticall?.nested?.[0]?.targetUnknown })
  )
}

// 9. A top-level multicall keeps its real (self-delegated) target.
{
  const w = hex => hex.replace(/^0x/, '').toLowerCase().padStart(64, '0')
  const p32 = hex => hex + '0'.repeat((64 - (hex.length % 64)) % 64)
  const usdc = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
  const transfer = 'a9059cbb' + w('d8da6bf26964af9d7eed9e03e53415d37aa96045') + w('1')
  const tx = { to: usdc, data: '0xac9650d8' + w('20') + w('1') + w('20') + w('44') + p32(transfer), chainId: 1 }
  await svc.prepare(tx)
  const r = svc.render(tx)
  const child = r.nested?.[0]
  const contract = child?.rows.find(row => row.labelKey === 'evm-decoder.contract-label')
  const amount = child?.rows.find(row => row.labelKey === 'evm-decoder.amount-label')
  check(
    'top-level multicall children keep the real target and token unit',
    r.targetUnknown === undefined &&
      child?.targetUnknown === undefined &&
      contract?.value.toLowerCase() === usdc &&
      amount?.value === '0.000001 USDC',
    JSON.stringify({ flag: child?.targetUnknown, contract, amount })
  )
}

// 10. i18n key existence: every translation key any renderer emitted must be
//    present in en.json. Catches typos and missed keys at build time.
{
  const { readFileSync } = await import('fs')
  const en = JSON.parse(readFileSync(join(projRoot, 'src/assets/i18n/en.json'), 'utf8'))
  function resolveKey(obj, key) {
    return key.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj)
  }
  const seen = new Set()
  function collect(r) {
    if (!r) return
    if (r.functionNameKey) seen.add(r.functionNameKey)
    if (r.warningKey) seen.add(r.warningKey)
    // mirrors the template, which renders this warning off the flag rather than warningKey
    if (r.targetUnknown) seen.add('evm-decoder.target-unknown-warning')
    for (const row of r.rows || []) {
      if (row.labelKey) seen.add(row.labelKey)
      if (row.valueKey) seen.add(row.valueKey)
    }
    for (const inner of r.nested || []) collect(inner)
  }
  // Exercise every renderer path to populate `seen`.
  const fixtures = [
    {
      to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      data:
        '0xa9059cbb' +
        '000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045' +
        '00000000000000000000000000000000000000000000000000000000000003e8',
      chainId: 1
    },
    {
      to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      data:
        '0x095ea7b3' +
        '0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d' +
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    },
    {
      to: '0xabcabcabcabcabcabcabcabcabcabcabcabcabca',
      data:
        '0x23b872dd' +
        '000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
        '000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' +
        '000000000000000000000000000000000000000000000000000000000000002a'
    },
    { to: '0xdead000000000000000000000000000000000000', data: '0xdeadbeef00' },
    { to: '', data: '' },
    // wrap(bytes) holding transfer(...) — exercises the unknown-target rows/warning
    (() => {
      const w = hex => hex.replace(/^0x/, '').toLowerCase().padStart(64, '0')
      const t = 'a9059cbb' + w('d8da6bf26964af9d7eed9e03e53415d37aa96045') + w('1')
      db.set('66666666', 'wrap(bytes)')
      return { to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', data: '0x66666666' + w('20') + w('44') + t + '0'.repeat(56), chainId: 1 }
    })()
  ]
  for (const f of fixtures) {
    await svc.prepare(f)
    collect(svc.render(f))
  }
  const missing = [...seen].filter(k => resolveKey(en, k) === undefined)
  check(
    `all ${seen.size} emitted i18n keys exist in en.json`,
    missing.length === 0,
    missing.length ? `missing: ${missing.join(', ')}` : ''
  )
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
