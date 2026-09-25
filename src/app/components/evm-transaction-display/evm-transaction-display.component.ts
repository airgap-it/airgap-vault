import { ClipboardService } from '@airgap/angular-core'
import { Component, Input } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

import { DisplayRow, RenderResult } from '../../services/evm/abi-types'
import { formatAmount } from '../../services/evm/known-tokens'

@Component({
  selector: 'airgap-evm-transaction-display',
  templateUrl: './evm-transaction-display.component.html',
  styleUrls: ['./evm-transaction-display.component.scss']
})
export class EvmTransactionDisplayComponent {
  @Input() public result!: RenderResult
  @Input() public dbDate?: string

  constructor(private readonly translate: TranslateService, private readonly clipboardService: ClipboardService) {}

  public confidenceLabelKey(): string {
    switch (this.result?.confidence) {
      case 'high':
        return 'evm-decoder.confidence-high'
      case 'medium':
        return 'evm-decoder.confidence-medium'
      case 'low':
        return 'evm-decoder.confidence-low'
      case 'unknown':
      default:
        return 'evm-decoder.confidence-unknown'
    }
  }

  public functionName(): string {
    if (!this.result) return ''
    if (this.result.functionNameKey) {
      return this.translate.instant(this.result.functionNameKey, this.result.functionNameParams)
    }
    return this.result.functionName || ''
  }

  public renderValue(row: DisplayRow): string {
    if (row.valueKey) return this.translate.instant(row.valueKey, row.valueParams)
    return row.value
  }

  public renderLabel(row: DisplayRow): string {
    if (row.labelKey) return this.translate.instant(row.labelKey)
    return row.label || ''
  }

  // ---- Display-only manual decimals selector --------------------------------
  // For a raw numeric value whose token decimals are unknown, the user may apply
  // a scale to preview the amount (Etherscan-style). It NEVER changes what is
  // signed — the raw value is always shown — is not persisted, and the preview
  // is clearly labelled as a user-assumed scale.
  private static readonly SCALES: ReadonlyArray<number | null> = [null, 6, 8, 18]
  private readonly scaleIndex = new Map<DisplayRow, number>()

  public isScalable(row: DisplayRow): boolean {
    return row.type === 'amount' && row.rawValue !== undefined
  }

  public currentDecimals(row: DisplayRow): number | null {
    return EvmTransactionDisplayComponent.SCALES[this.scaleIndex.get(row) ?? 0]
  }

  /** Cycle raw → 6 → 8 → 18 → raw. Display-only. */
  public cycleDecimals(row: DisplayRow): void {
    const next = ((this.scaleIndex.get(row) ?? 0) + 1) % EvmTransactionDisplayComponent.SCALES.length
    this.scaleIndex.set(row, next)
  }

  /** The user-scaled preview, or null when showing the raw value. */
  public scaledValue(row: DisplayRow): string | null {
    const decimals = this.currentDecimals(row)
    if (decimals === null || row.rawValue === undefined) return null
    try {
      return formatAmount(BigInt(row.rawValue), decimals)
    } catch {
      return null
    }
  }

  // ---- Long address / hex values ---------------------------------------------
  // Shown on one horizontally scrollable line by default; a tap toggles a wrapped
  // view so long blobs (e.g. undecoded calldata) can be reviewed without scrolling.
  // Display-only, not persisted.
  private readonly expanded = new Set<DisplayRow>()

  /** Address/hex rows that show their literal value (not a translated placeholder). */
  public isExpandable(row: DisplayRow): boolean {
    return (row.type === 'address' || row.type === 'hex') && !row.valueKey
  }

  public isExpanded(row: DisplayRow): boolean {
    return this.expanded.has(row)
  }

  public toggleExpanded(row: DisplayRow): void {
    if (!this.isExpandable(row)) return
    if (!this.expanded.delete(row)) this.expanded.add(row)
  }

  public async copyValue(row: DisplayRow): Promise<void> {
    await this.clipboardService.copyAndShowToast(row.value)
  }
}
