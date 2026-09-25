export type DecodeSource = 'hardcoded' | 'database'

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unknown'

export type RenderType =
  | 'erc20-transfer'
  | 'erc20-approve'
  | 'erc721-transfer'
  | 'multicall'
  | 'generic-decoded'
  | 'raw-hex'

export type DecodedValue =
  | { kind: 'address'; value: string }
  | { kind: 'uint'; value: bigint; display: string }
  | { kind: 'int'; value: bigint; display: string }
  | { kind: 'bool'; value: boolean }
  | { kind: 'bytes'; value: Uint8Array; hex: string }
  | { kind: 'string'; value: string }
  | { kind: 'array'; items: DecodedValue[] }
  | { kind: 'tuple'; fields: DecodedParam[] }

export interface DecodedParam {
  name: string | null
  type: string
  value: DecodedValue
}

export interface DecodedCall {
  selector: string
  signature: string
  functionName: string
  params: DecodedParam[]
  source: DecodeSource
}

export interface SignatureLookupResult {
  signature: string
  selector: string
  collisions: number
}

export interface SignatureDatabaseMetadata {
  generatedAt: string
  sourcifyExportDate: string
  totalSignatures: number
  schemaVersion: number
}

export interface DisplayRow {
  /** i18n key for the label; if absent, `label` is used verbatim */
  labelKey?: string
  /** Plain label fallback (or for synthesised text like "arg0 (uint256)") */
  label?: string
  /** Already-formatted display value (addresses, amounts, etc.) */
  value: string
  /** Optional i18n key whose translation replaces value */
  valueKey?: string
  /** Optional params passed to the translation pipe */
  valueParams?: Record<string, string | number>
  type: 'address' | 'amount' | 'text' | 'hex' | 'warning'
  /** Raw integer (base units) for an `amount` whose token decimals are unknown.
   *  Enables the display-only manual decimals selector; never affects what is signed. */
  rawValue?: string
  /** Resolved well-known name for an `address` value (e.g. "USDC", "Uniswap V2: Router 2").
   *  A display hint only — the raw address in `value` stays visible. */
  addressName?: string
  /** Nesting depth for indenting array/tuple element rows; absent ⇒ 0 */
  depth?: number
}

export interface RenderResult {
  type: RenderType
  confidence: ConfidenceLevel
  rows: DisplayRow[]
  warningKey?: string
  warningParams?: Record<string, string | number>
  nested?: RenderResult[]
  /** True when this call's execution target is not knowable from the calldata
   *  (see {@link EvmTransactionInput.to}); the UI must warn instead of implying one. */
  targetUnknown?: boolean
  rawCalldata: string
  functionNameKey?: string
  functionNameParams?: Record<string, string | number>
  /** Plain text fallback if no key is available */
  functionName?: string
}

export interface EvmTransactionInput {
  /**
   * Contract the calldata executes against, or `undefined` when the target is
   * genuinely unknown. Only the outermost transaction (and a self-delegating
   * `multicall`) has a known target: calldata recovered from a `bytes` parameter
   * runs somewhere the decoder cannot determine — a Safe `initializer` executes
   * on the freshly created proxy, `execTransaction(to, value, data, …)` executes
   * `data` against its own `to` argument. Never back-fill this with the outer
   * contract; an unverifiable target must be displayed as unknown.
   */
  to?: string
  data: string
  value?: string
  chainId?: number
}
