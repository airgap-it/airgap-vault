#!/usr/bin/env node
// Smoke test: exercises the decoder + renderer logic via ts-stripped imports.
// Not a replacement for karma — just enough to catch obvious regressions when
// running outside a browser.

import { execSync } from 'child_process'
import { mkdtempSync, writeFileSync, readFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const tmp = mkdtempSync(join(tmpdir(), 'agv-smoke-'))
const projRoot = join(import.meta.dirname, '..')

// Use tsc to emit JS for the files under test, then import.
const files = [
  join(projRoot, 'src/app/services/evm/abi-decoder.service.ts'),
  join(projRoot, 'src/app/services/evm/abi-types.ts'),
  join(projRoot, 'src/app/services/evm/known-tokens.ts'),
  join(projRoot, 'scripts/stubs/angular-core.ts')
]
const tsconfig = {
  compilerOptions: {
    target: 'ES2020',
    module: 'ESNext',
    moduleResolution: 'node',
    strict: false,
    skipLibCheck: true,
    esModuleInterop: true,
    experimentalDecorators: true,
    outDir: tmp,
    rootDir: projRoot
  },
  files,
  include: []
}
writeFileSync(join(tmp, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2))
execSync(`npx tsc -p "${join(tmp, 'tsconfig.json')}"`, { cwd: projRoot, stdio: 'inherit' })

// The emitted JS still imports '@angular/core' — rewrite to a tmp stub.
const stubJs = join(tmp, 'angular-core.js')
writeFileSync(stubJs, 'export const Injectable = () => (_) => {}\n')
const decFile = `${tmp}/src/app/services/evm/abi-decoder.service.js`
const decSrc = readFileSync(decFile, 'utf8').replace(
  /from ['"]@angular\/core['"]/g,
  `from "${stubJs.replace(/\\/g, '/')}"`
)
writeFileSync(decFile, decSrc)

const { AbiDecoderService } = await import(`file://${decFile}`)
const { formatAmount, isUnlimitedApproval, lookupKnownToken } = await import(
  `file://${tmp}/src/app/services/evm/known-tokens.js`
)

let pass = 0
let fail = 0
function check(name, cond) {
  if (cond) {
    console.log('  PASS', name)
    pass++
  } else {
    console.error('  FAIL', name)
    fail++
  }
}

console.log('AbiDecoderService')
const dec = new AbiDecoderService()
check('selector extraction', dec.extractSelector('0xa9059cbb000000') === 'a9059cbb')
check('short calldata -> null', dec.extractSelector('0x01') === null)
const r1 = dec.decodeWithSignature(
  '0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa9604500000000000000000000000000000000000000000000000000000000000003e8',
  'transfer(address,uint256)'
)
check('decode transfer name', r1 && r1.functionName === 'transfer')
check('decode transfer amount', r1 && r1.params[1].value.kind === 'uint' && r1.params[1].value.value === 1000n)
check('decode transfer address', r1 && r1.params[0].value.value === '0xd8da6bf26964af9d7eed9e03e53415d37aa96045')
const rApprove = dec.decodeWithSignature(
  '0x095ea7b30000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  'approve(address,uint256)'
)
check('decode approve unlimited', rApprove && rApprove.params[1].value.value === (1n << 256n) - 1n)
const rBytes = dec.decodeWithSignature(
  '0x00000000' +
    '0000000000000000000000000000000000000000000000000000000000000020' +
    '0000000000000000000000000000000000000000000000000000000000000004' +
    'deadbeef00000000000000000000000000000000000000000000000000000000',
  'foo(bytes)'
)
check('decode dynamic bytes', rBytes && rBytes.params[0].value.hex === '0xdeadbeef')
const rString = dec.decodeWithSignature(
  '0x00000000' +
    '0000000000000000000000000000000000000000000000000000000000000020' +
    '0000000000000000000000000000000000000000000000000000000000000002' +
    '6869000000000000000000000000000000000000000000000000000000000000',
  'foo(string)'
)
check('decode string', rString && rString.params[0].value.value === 'hi')
const rTuple = dec.decodeWithSignature(
  '0x00000000' +
    '000000000000000000000000deaddeaddeaddeaddeaddeaddeaddeaddeaddead' +
    '0000000000000000000000000000000000000000000000000000000000000001',
  'foo((address,uint256))'
)
check('decode tuple', rTuple && rTuple.params[0].value.kind === 'tuple')
check('never throws on garbage', dec.decodeWithSignature('garbage', 'foo()') === null)
check('null on bad sig', dec.decodeWithSignature('0xa9059cbb', 'not a sig') === null)

console.log('known-tokens')
const usdc = lookupKnownToken(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
check('USDC found', usdc && usdc.symbol === 'USDC' && usdc.decimals === 6)
check('unknown token', lookupKnownToken(1, '0x0000000000000000000000000000000000000000') === null)
check('format 1.5 USDC', formatAmount(1500000n, 6, 'USDC') === '1.5 USDC')
check('format 1 ETH', formatAmount(1000000000000000000n, 18, 'ETH') === '1 ETH')
check('format 0', formatAmount(0n, 18, 'ETH') === '0 ETH')
check('unlimited approval', isUnlimitedApproval((1n << 256n) - 1n) === true)
check('not unlimited', isUnlimitedApproval(0n) === false)

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
