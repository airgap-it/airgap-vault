import { AbiDecoderService } from '../../services/evm/abi-decoder.service'
import { ConfidenceLevel, DecodedParam, DisplayRow, EvmTransactionInput, RenderResult } from '../../services/evm/abi-types'
import { contractRow, isBlockedSelector, looksLikeCalldata, RendererContext, selectorOf, TransactionRenderer } from './base.renderer'

const CONFIDENCE_ORDER: ConfidenceLevel[] = ['high', 'medium', 'low', 'unknown']

/** Lower the inner result's confidence so it never exceeds (out-ranks) its container's. */
function cappedConfidence(inner: ConfidenceLevel, cap: ConfidenceLevel): ConfidenceLevel {
  return CONFIDENCE_ORDER[Math.max(CONFIDENCE_ORDER.indexOf(inner), CONFIDENCE_ORDER.indexOf(cap))]
}

export class GenericAbiRenderer implements TransactionRenderer {
  constructor(
    private readonly decoder: AbiDecoderService,
    private readonly cache: Map<string, { sig: string; collisions: number } | null>
  ) {}

  public matches(_tx: EvmTransactionInput): boolean {
    return true
  }

  public render(tx: EvmTransactionInput, ctx?: RendererContext): RenderResult | null {
    const sel = selectorOf(tx.data)
    if (!sel || sel.length < 8) return null
    // Scam selectors (0x00000000 / 0xffffffff are squatted by ~dozens of junk
    // signatures) always fall through to raw hex, never a misleading decode.
    if (isBlockedSelector(sel)) return null
    const cached = this.cache.get(sel)
    if (cached === undefined) return null
    if (cached === null) return null
    const decoded = this.decoder.decodeWithSignature(tx.data, cached.sig, 'database')
    if (!decoded) return null
    const fn = decoded.functionName
    const collisionWarn = cached.collisions > 1
    const confidence: ConfidenceLevel = collisionWarn ? 'low' : 'medium'

    // Recursively decode any bytes parameter whose content is itself calldata
    // (e.g. a Gnosis Safe createProxyWithNonce `initializer` wrapping setup(...)),
    // so the signer can verify the wrapped call instead of an opaque hex blob.
    const nested: RenderResult[] = []
    const decodedAsCalldata = new Set<number>()
    if (ctx && ctx.depth < ctx.maxDepth) {
      decoded.params.forEach((p, i) => {
        const inner = this.tryDecodeBytesParam(tx, p, ctx)
        if (inner) {
          nested.push({ ...inner, confidence: cappedConfidence(inner.confidence, confidence) })
          decodedAsCalldata.add(i)
        }
      })
    }

    const rows: DisplayRow[] = []
    decoded.params.forEach((p, i) => {
      if (decodedAsCalldata.has(i)) {
        rows.push({
          label: `arg${i} (${p.type})`,
          valueKey: 'evm-decoder.bytes-decoded-below',
          value: '↓ decoded below',
          type: 'text'
        })
      } else {
        rows.push(...paramToRows(`arg${i}`, p))
      }
    })

    return {
      type: 'generic-decoded',
      confidence,
      functionName: `${fn}(…)`,
      rows: [
        { labelKey: 'evm-decoder.function-label', value: fn, type: 'text' },
        contractRow(tx),
        ...rows
      ],
      warningKey: collisionWarn ? 'evm-decoder.collision-warning' : 'evm-decoder.database-note',
      warningParams: collisionWarn ? { count: cached.collisions } : undefined,
      nested: nested.length ? nested : undefined,
      rawCalldata: tx.data
    }
  }

  /**
   * If `p` is a dynamic `bytes` parameter holding decodable embedded calldata,
   * render it through the full renderer chain (so ERC-20/721, multicall and DB
   * decodes all work) and return it as a nested result. Returns null — leaving
   * the plain raw-hex row in place — for blocklisted selectors, non-calldata
   * shapes, or content that does not actually decode.
   *
   * The inner transaction deliberately carries NO `to`: the target of a call
   * wrapped in a `bytes` argument is chosen at execution time (a Safe
   * `initializer` runs on the new proxy, `execTransaction(to, …)` runs against
   * its own `to` argument) and is never the outer contract. Inheriting `tx.to`
   * here would both label the nested call with a contract it does not run on and
   * let a known-token hit on the outer address denominate the inner amount in the
   * wrong unit. `chainId` is still propagated — that one is genuinely known.
   */
  private tryDecodeBytesParam(tx: EvmTransactionInput, p: DecodedParam, ctx: RendererContext): RenderResult | null {
    if (p.value.kind !== 'bytes' || p.type !== 'bytes') return null
    if (!looksLikeCalldata(p.value.value)) return null
    if (isBlockedSelector(selectorOf(p.value.hex))) return null
    const innerTx: EvmTransactionInput = { data: p.value.hex, value: '0', chainId: tx.chainId }
    const inner = ctx.renderInner(innerTx, { ...ctx, depth: ctx.depth + 1 })
    return inner.type === 'raw-hex' ? null : inner
  }
}

/** Max array elements rendered before truncating, to keep the signing UI bounded. */
const MAX_ARRAY_ITEMS = 50

/**
 * Strip exactly one trailing array dimension from an ABI type string.
 *   'address[]' -> 'address' ; 'uint256[][]' -> 'uint256[]' ;
 *   'uint256[3]' -> 'uint256' ; '(address,uint256)[]' -> '(address,uint256)'
 * The last '[' is always the outermost dimension (raw types are built left-to-right;
 * tuple brackets are balanced inside '(...)').
 */
export function elementType(arrayType: string): string {
  const i = arrayType.lastIndexOf('[')
  return i === -1 ? arrayType : arrayType.slice(0, i)
}

/**
 * Render a decoded parameter into one or more display rows. Arrays and tuples expand
 * into a header row (with element/field count) followed by one recursively-rendered row
 * per element/field, indented by `depth`, so the signer can verify every recipient and
 * amount in a batched call rather than seeing a collapsed "[N items]" placeholder.
 */
export function paramToRows(label: string, p: DecodedParam, depth = 0): DisplayRow[] {
  const v = p.value
  switch (v.kind) {
    case 'address':
      return [{ label: `${label} (address)`, value: v.value, type: 'address', depth }]
    case 'uint':
      return [{ label: `${label} (${p.type})`, value: v.display, type: 'amount', rawValue: v.display, depth }]
    case 'int':
      return [{ label: `${label} (${p.type})`, value: v.display, type: 'amount', depth }]
    case 'bool':
      return [{ label: `${label} (bool)`, value: v.value ? 'true' : 'false', type: 'text', depth }]
    case 'bytes':
      return [{ label: `${label} (${p.type})`, value: v.hex, type: 'hex', depth }]
    case 'string':
      return [{ label: `${label} (string)`, value: v.value, type: 'text', depth }]
    case 'array': {
      const rows: DisplayRow[] = [
        {
          label: `${label} (${p.type})`,
          value: `${v.items.length} items`,
          valueKey: 'evm-decoder.array-items',
          valueParams: { count: v.items.length },
          type: 'text',
          depth
        }
      ]
      const elemType = elementType(p.type)
      const shown = Math.min(v.items.length, MAX_ARRAY_ITEMS)
      for (let i = 0; i < shown; i++) {
        rows.push(...paramToRows(`${label}[${i}]`, { name: null, type: elemType, value: v.items[i] }, depth + 1))
      }
      if (v.items.length > MAX_ARRAY_ITEMS) {
        rows.push({
          label: `${label} (…)`,
          value: `… and ${v.items.length - MAX_ARRAY_ITEMS} more`,
          valueKey: 'evm-decoder.array-truncated',
          valueParams: { count: v.items.length - MAX_ARRAY_ITEMS },
          type: 'text',
          depth: depth + 1
        })
      }
      return rows
    }
    case 'tuple': {
      const rows: DisplayRow[] = [
        {
          label: `${label} (${p.type})`,
          value: `${v.fields.length} fields`,
          valueKey: 'evm-decoder.tuple-fields',
          valueParams: { count: v.fields.length },
          type: 'text',
          depth
        }
      ]
      v.fields.forEach((f, i) => rows.push(...paramToRows(`${label}[${i}]`, f, depth + 1)))
      return rows
    }
  }
}
