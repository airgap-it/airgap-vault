import { Injectable } from '@angular/core'

import { Erc20Renderer } from '../../renderers/evm/erc20.renderer'
import { Erc721Renderer } from '../../renderers/evm/erc721.renderer'
import { GenericAbiRenderer } from '../../renderers/evm/generic-abi.renderer'
import { MulticallRenderer } from '../../renderers/evm/multicall.renderer'
import { RawHexRenderer } from '../../renderers/evm/raw-hex.renderer'
import {
  contractRow,
  isBlockedSelector,
  looksLikeCalldata,
  RendererContext,
  TransactionRenderer,
  selectorOf
} from '../../renderers/evm/base.renderer'

import { AbiDecoderService, bytesToHex } from './abi-decoder.service'
import { DecodedParam, DecodedValue, EvmTransactionInput, RenderResult } from './abi-types'
import { resolveAddressName } from './known-tokens'
import { SignatureDatabaseService } from './signature-database.service'

const MAX_DEPTH = 3

const MULTICALL_SIGS: Record<string, string> = {
  ac9650d8: 'multicall(bytes[])',
  '5ae401dc': 'multicall(uint256,bytes[])',
  '1f0464d1': 'multicall(bytes32,bytes[])' // NOT 1f931c1c (= EIP-2535 diamondCut)
}

@Injectable({ providedIn: 'root' })
export class EvmTransactionRendererService {
  private readonly dedicated: TransactionRenderer[]
  private readonly genericCache = new Map<string, { sig: string; collisions: number } | null>()
  private readonly generic: GenericAbiRenderer
  private readonly rawHex = new RawHexRenderer()
  private readonly decoder: AbiDecoderService

  constructor(decoder: AbiDecoderService, private readonly db: SignatureDatabaseService) {
    this.decoder = decoder
    this.dedicated = [new Erc20Renderer(decoder), new Erc721Renderer(decoder), new MulticallRenderer(decoder)]
    this.generic = new GenericAbiRenderer(decoder, this.genericCache)
  }

  public async getDbMetadata() {
    return this.db.getMetadata()
  }

  /**
   * Prefetch every signature the renderer will need, depth-capped. Generic
   * functions hide embedded calldata inside `bytes` params whose positions are
   * only known after the *outer* signature resolves, so this runs round by round:
   * look up the current round's selectors in one DB pass, decode each blob with
   * its resolved signature, harvest the selectors of every embedded-calldata
   * `bytes` value (incl. inside arrays/tuples and hardcoded multicall payloads),
   * then repeat with those until nothing new appears or the depth cap is hit.
   */
  public async prepare(tx: EvmTransactionInput): Promise<void> {
    await this.db.initialize()
    const expanded = new Set<string>()
    let frontier: string[] = tx.data && selectorOf(tx.data).length === 8 ? [tx.data] : []
    for (let depth = 0; depth <= MAX_DEPTH && frontier.length > 0; depth++) {
      // 1. Resolve the selectors of this round's blobs in a single DB pass.
      const missing = new Set<string>()
      for (const data of frontier) {
        const sel = selectorOf(data)
        if (sel.length === 8 && !isBlockedSelector(sel) && !this.genericCache.has(sel)) missing.add(sel)
      }
      if (missing.size > 0) {
        const sels = [...missing]
        const results = await Promise.all(sels.map(s => this.db.lookup(s)))
        sels.forEach((sel, i) => {
          const r = results[i]
          this.genericCache.set(sel, r ? { sig: r.signature, collisions: r.collisions } : null)
        })
      }
      if (depth === MAX_DEPTH) break
      // 2. Decode each blob and gather the embedded calldata to look up next round.
      const next: string[] = []
      for (const data of frontier) {
        if (expanded.has(data)) continue
        expanded.add(data)
        const sel = selectorOf(data)
        const sig = MULTICALL_SIGS[sel] ?? this.genericCache.get(sel)?.sig
        if (!sig) continue
        const decoded = this.decoder.decodeWithSignature(data, sig)
        if (!decoded) continue
        this.collectEmbeddedCalldata(decoded.params, next)
      }
      frontier = next
    }
  }

  public render(tx: EvmTransactionInput): RenderResult {
    const ctx: RendererContext = {
      depth: 0,
      maxDepth: MAX_DEPTH,
      renderInner: (innerTx, innerCtx) => this.renderWith(innerTx, innerCtx)
    }
    const result = this.renderWith(tx, ctx)
    this.annotateAddressNames(result, tx.chainId)
    return result
  }

  /** Raw-calldata view with the "could not decode" warning, for when decoding itself fails. */
  public renderRaw(tx: EvmTransactionInput): RenderResult {
    return this.flagUnknownTarget(tx, this.rawHex.render(tx))
  }

  /**
   * Attach curated well-known names (USDC, Uniswap V2: Router 2, …) to every
   * `address` row across the whole result tree. Single pass over all renderers'
   * output keeps the lookup in one place; the raw address in `row.value` is left
   * untouched, so a name is only ever an additional hint.
   */
  private annotateAddressNames(result: RenderResult, chainId: number | undefined): void {
    for (const row of result.rows) {
      if (row.type === 'address') {
        const name = resolveAddressName(chainId, row.value)
        if (name) row.addressName = name
      }
    }
    if (result.nested) {
      for (const inner of result.nested) this.annotateAddressNames(inner, chainId)
    }
  }

  private renderWith(tx: EvmTransactionInput, ctx: RendererContext): RenderResult {
    return this.flagUnknownTarget(tx, this.dispatch(tx, ctx))
  }

  /**
   * Mark every result produced for a transaction with no known target, so the UI
   * can warn that the contract this call executes against is undeterminable.
   * Stamped here rather than in each renderer: the flag follows `tx.to` alone, and
   * a `multicall` recovered from a `bytes` param propagates the absent `to` to its
   * own children, so the whole subtree is flagged automatically.
   */
  private flagUnknownTarget(tx: EvmTransactionInput, result: RenderResult): RenderResult {
    return tx.to === undefined ? { ...result, targetUnknown: true } : result
  }

  private dispatch(tx: EvmTransactionInput, ctx: RendererContext): RenderResult {
    if (!tx.data || tx.data === '0x' || tx.data.length <= 2) {
      return {
        type: 'raw-hex',
        confidence: 'high',
        functionNameKey: 'evm-decoder.fn-plain-transfer',
        rows: [
          {
            labelKey: 'evm-decoder.function-label',
            valueKey: 'evm-decoder.fn-plain-transfer',
            value: 'Plain value transfer (no calldata)',
            type: 'text'
          },
          contractRow(tx, 'evm-decoder.to-label')
        ],
        rawCalldata: tx.data || '0x'
      }
    }
    for (const r of this.dedicated) {
      if (r.matches(tx)) {
        const result = r.render(tx, ctx)
        if (result) return result
      }
    }
    const fromDb = this.generic.render(tx, ctx)
    if (fromDb) return fromDb
    return this.rawHex.render(tx)
  }

  /** Collect every embedded-calldata blob found in a decoded call's params. */
  private collectEmbeddedCalldata(params: DecodedParam[], out: string[]): void {
    for (const p of params) this.collectCalldataFromValue(p.value, out)
  }

  /**
   * Recurse through a decoded value, pushing the hex of every `bytes` value that
   * looks like calldata (4-byte selector + whole words) and is not blocklisted.
   * `bytes[]` arrays (multicall) and tuple fields are walked transparently.
   */
  private collectCalldataFromValue(v: DecodedValue, out: string[]): void {
    switch (v.kind) {
      case 'bytes':
        if (looksLikeCalldata(v.value) && !isBlockedSelector(bytesToHex(v.value).slice(0, 8))) {
          out.push('0x' + bytesToHex(v.value))
        }
        break
      case 'array':
        for (const item of v.items) this.collectCalldataFromValue(item, out)
        break
      case 'tuple':
        for (const f of v.fields) this.collectCalldataFromValue(f.value, out)
        break
      default:
        break
    }
  }
}
