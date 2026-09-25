/**
 * End-to-end integration spec for the EVM ABI decoder feature.
 *
 * Mounts the real TransactionComponent with the real EvmTransactionRendererService,
 * AbiDecoderService, and SignatureDatabaseService — only HttpClient and
 * ContactsService are stubbed. HttpClient serves an in-memory v2 signature DB so
 * the runtime parser, binary search and renderer pipeline are all exercised
 * end-to-end against rendered DOM.
 */
import { ClipboardService, ProtocolService } from '@airgap/angular-core'
import { HttpClient } from '@angular/common/http'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { IAirGapTransaction, MainProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core'
import { of } from 'rxjs'

import { ContactsService } from '../../services/contacts/contacts.service'
import { EvmTransactionRendererService } from '../../services/evm/transaction-renderer.service'
import { EvmTransactionDisplayComponent } from '../evm-transaction-display/evm-transaction-display.component'
import { TransactionWarningComponent } from '../transaction-warning/transaction-warning.component'
import enJson from '../../../assets/i18n/en.json'

import { TransactionComponent } from './transaction.component'

// Some webpack setups wrap JSON imports in a `default` property; handle both.
const EN: Record<string, any> = (enJson as any).default || (enJson as any)

/**
 * Build a v2 signature DB (matches scripts/build-signature-db.js + the runtime
 * format) entirely in memory so the test does not depend on a build artefact.
 */
function buildDb(entries: { selector: string; signature: string; collisions?: number }[]): ArrayBuffer {
  const sorted = [...entries].sort((a, b) => (a.selector < b.selector ? -1 : 1))
  const blobChunks: Uint8Array[] = []
  const offsets: number[] = []
  let blobLen = 0
  for (const e of sorted) {
    const sigBytes = new TextEncoder().encode(e.signature)
    offsets.push(blobLen)
    const header = new Uint8Array(4)
    const dv = new DataView(header.buffer)
    dv.setUint16(0, e.collisions ?? 1, true)
    dv.setUint16(2, sigBytes.length, true)
    blobChunks.push(header, sigBytes)
    blobLen += 4 + sigBytes.length
  }
  const head = new Uint8Array(12)
  const headDv = new DataView(head.buffer)
  head.set([0x41, 0x34, 0x42, 0x59], 0) // 'A4BY'
  headDv.setUint32(4, 2, true)
  headDv.setUint32(8, sorted.length, true)
  const index = new Uint8Array(sorted.length * 8)
  const indexDv = new DataView(index.buffer)
  for (let i = 0; i < sorted.length; i++) {
    const sel = sorted[i].selector
    index[i * 8 + 0] = parseInt(sel.slice(0, 2), 16)
    index[i * 8 + 1] = parseInt(sel.slice(2, 4), 16)
    index[i * 8 + 2] = parseInt(sel.slice(4, 6), 16)
    index[i * 8 + 3] = parseInt(sel.slice(6, 8), 16)
    indexDv.setUint32(i * 8 + 4, offsets[i], true)
  }
  let total = head.length + index.length
  for (const c of blobChunks) total += c.length
  const out = new Uint8Array(total)
  let off = 0
  out.set(head, off)
  off += head.length
  out.set(index, off)
  off += index.length
  for (const c of blobChunks) {
    out.set(c, off)
    off += c.length
  }
  return out.buffer
}

const DB_BUFFER = buildDb([
  // Just enough for the generic-decode test case below.
  { selector: 'cdef1234', signature: 'foo(uint256)', collisions: 1 },
  { selector: 'deadbeef', signature: 'bar(address,uint256)', collisions: 3 }
])

const DB_META = {
  generatedAt: '2026-05-25T00:00:00Z',
  sourcifyExportDate: '2026-05-25',
  totalSignatures: 2,
  schemaVersion: 2,
  source: 'test',
  sha256: 'test'
}

class FakeHttpClient {
  get(url: string): any {
    if (url.includes('signatures.db')) return of(DB_BUFFER)
    if (url.includes('signatures.meta.json')) return of(DB_META)
    return of(null)
  }
}

function evmTx(args: { to: string; data: string; protocolIdentifier?: any }): IAirGapTransaction {
  return {
    amount: '0',
    fee: '0',
    from: ['0x1111111111111111111111111111111111111111'],
    to: [args.to],
    isInbound: false,
    network: null as any,
    protocolIdentifier: args.protocolIdentifier ?? MainProtocolSymbols.ETH,
    data: args.data
  } as IAirGapTransaction
}

describe('TransactionComponent — EVM decoder (e2e)', () => {
  let component: TransactionComponent
  let fixture: ComponentFixture<TransactionComponent>
  const contactsSpy = jasmine.createSpyObj('ContactsService', ['isBookEnabled', 'getContactName'])
  const protocolSpy = jasmine.createSpyObj('ProtocolService', ['getProtocol'])

  beforeEach(async () => {
    contactsSpy.isBookEnabled.and.returnValue(Promise.resolve(false))
    contactsSpy.getContactName.and.returnValue(Promise.resolve(null))
    await TestBed.configureTestingModule({
      declarations: [TransactionComponent, EvmTransactionDisplayComponent, TransactionWarningComponent],
      imports: [IonicModule.forRoot({ innerHTMLTemplatesEnabled: true }), TranslateModule.forRoot()],
      providers: [
        { provide: HttpClient, useClass: FakeHttpClient },
        { provide: ContactsService, useValue: contactsSpy },
        { provide: ClipboardService, useValue: jasmine.createSpyObj('ClipboardService', ['copyAndShowToast']) },
        { provide: ProtocolService, useValue: protocolSpy }
      ]
    })
      // Schemas: the real TransactionComponent template uses pipes (amountConverter / feeConverter)
      // and sub-components (airgap-from-to) we don't bring in. Use NO_ERRORS_SCHEMA via
      // .overrideComponent to keep the template parse permissive.
      .overrideComponent(TransactionComponent, {
        set: { template: '<airgap-evm-transaction-display *ngFor="let r of evmResults$ | async" [result]="r"></airgap-evm-transaction-display>' }
      })
      .compileComponents()

    const translate = TestBed.inject(TranslateService)
    translate.setTranslation('en', EN, true)
    translate.use('en')

    fixture = TestBed.createComponent(TransactionComponent)
    component = fixture.componentInstance
  })

  async function runWith(tx: IAirGapTransaction[]) {
    component.airGapTxs = tx
    await component.ngOnInit()
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
  }

  it('renders an ERC-20 transfer with verified badge and pretty USDC amount', async () => {
    await runWith([
      evmTx({
        to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        data:
          '0xa9059cbb' +
          '000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045' +
          '00000000000000000000000000000000000000000000000000000000000f4240'
      })
    ])
    const root = fixture.nativeElement as HTMLElement
    const text = root.textContent || ''
    expect(text).toContain('Verified standard')
    expect(text).toContain('Token Transfer')
    expect(text).toContain('1 USDC')
    expect(text).toContain('0xd8da6bf26964af9d7eed9e03e53415d37aa96045')
  })

  it('uses the token contract, not the recipient in `to`, for ERC-20 sub-protocols', async () => {
    protocolSpy.getProtocol.and.returnValue(
      Promise.resolve({ getContractAddress: () => Promise.resolve('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48') })
    )
    await runWith([
      evmTx({
        // coinlib's ERC20 protocol reports the token recipient as `to`
        to: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        protocolIdentifier: SubProtocolSymbols.ETH_ERC20,
        data:
          '0xa9059cbb' +
          '000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045' +
          '00000000000000000000000000000000000000000000000000000000000f4240'
      })
    ])
    const text = (fixture.nativeElement as HTMLElement).textContent || ''
    expect(text).toContain('1 USDC')
    expect(text).toContain('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
  })

  it('renders raw calldata with a warning when decoding throws', async () => {
    const renderer = TestBed.inject(EvmTransactionRendererService)
    spyOn(renderer, 'render').and.throwError('boom')
    await runWith([evmTx({ to: '0xabcabcabcabcabcabcabcabcabcabcabcabcabca', data: '0x12345678' })])
    const text = (fixture.nativeElement as HTMLElement).textContent || ''
    expect(text).toContain('Could not decode')
  })

  it('renders an unlimited approval in warning style', async () => {
    await runWith([
      evmTx({
        to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        data:
          '0x095ea7b3' +
          '0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d' +
          'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      })
    ])
    const text = (fixture.nativeElement as HTMLElement).textContent || ''
    expect(text).toContain('Token Approval')
    expect(text).toContain('Unlimited')
    expect(text).toContain('grants the spender permission')
  })

  it('renders transferFrom as ambiguous with explicit warning', async () => {
    await runWith([
      evmTx({
        to: '0xabcabcabcabcabcabcabcabcabcabcabcabcabca',
        data:
          '0x23b872dd' +
          '000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
          '000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' +
          '000000000000000000000000000000000000000000000000000000000000002a'
      })
    ])
    const text = (fixture.nativeElement as HTMLElement).textContent || ''
    expect(text).toContain('Ambiguous match')
    expect(text).toContain('ERC-20 transferFrom and ERC-721 transferFrom')
  })

  it('renders an unknown selector as raw hex with could-not-decode indicator', async () => {
    await runWith([
      evmTx({
        to: '0xabcabcabcabcabcabcabcabcabcabcabcabcabca',
        data: '0xfeedface00112233'
      })
    ])
    const text = (fixture.nativeElement as HTMLElement).textContent || ''
    expect(text).toContain('Could not decode')
    expect(text).toContain('0xfeedface00112233')
  })

  it('renders a database hit (medium confidence) for an unknown but lookup-able selector', async () => {
    await runWith([
      evmTx({
        to: '0xabcabcabcabcabcabcabcabcabcabcabcabcabca',
        data: '0xcdef1234' + '0000000000000000000000000000000000000000000000000000000000000007'
      })
    ])
    const text = (fixture.nativeElement as HTMLElement).textContent || ''
    expect(text).toContain('Database match')
    expect(text).toContain('foo')
    expect(text).toContain('7')
  })

  it('surfaces a low-confidence collision warning when the DB reports >1 collisions', async () => {
    await runWith([
      evmTx({
        to: '0xabcabcabcabcabcabcabcabcabcabcabcabcabca',
        data:
          '0xdeadbeef' +
          '000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
          '0000000000000000000000000000000000000000000000000000000000000001'
      })
    ])
    const text = (fixture.nativeElement as HTMLElement).textContent || ''
    expect(text).toContain('Ambiguous match')
    expect(text).toContain('Multiple function signatures')
  })

  it('renders multicall with two inner ERC-20 transfers nested', async () => {
    const inner =
      'a9059cbb' +
      '000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045' +
      '0000000000000000000000000000000000000000000000000000000000000001'
    const pad = '0'.repeat(56)
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
    await runWith([evmTx({ to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', data })])
    const text = (fixture.nativeElement as HTMLElement).textContent || ''
    expect(text).toContain('Multicall (2 calls)')
    // The two inner Token Transfer rows render via the recursive component
    const tokenTransferOccurrences = (text.match(/Token Transfer/g) || []).length
    expect(tokenTransferOccurrences).toBeGreaterThanOrEqual(2)
  })

  it('ignores non-EVM transactions', async () => {
    const btcTx = {
      amount: '1000',
      fee: '10',
      from: ['bc1qaddr'],
      to: ['bc1qother'],
      isInbound: false,
      network: null as any,
      protocolIdentifier: MainProtocolSymbols.BTC,
      data: '0xshouldNotBeDecoded'
    } as IAirGapTransaction
    await runWith([btcTx])
    // evmResults$ should contain only nulls -> the *ngFor in the overridden
    // template iterates and skips nulls naturally because *ngIf is in the original
    // template. Just assert no decoder badge appears.
    const text = (fixture.nativeElement as HTMLElement).textContent || ''
    expect(text).not.toContain('Verified standard')
    expect(text).not.toContain('Could not decode')
  })
})
