import { AbiDecoderService } from '../../services/evm/abi-decoder.service'
import { DecodedCall, EvmTransactionInput, RenderResult } from '../../services/evm/abi-types'
import { formatAmount, isUnlimitedApproval, lookupKnownToken } from '../../services/evm/known-tokens'
import { contractRow, selectorOf, TransactionRenderer } from './base.renderer'

const TRANSFER = 'a9059cbb'
const APPROVE = '095ea7b3'

export class Erc20Renderer implements TransactionRenderer {
  constructor(private readonly decoder: AbiDecoderService) {}

  public matches(tx: EvmTransactionInput): boolean {
    const sel = selectorOf(tx.data)
    return sel === TRANSFER || sel === APPROVE
  }

  public render(tx: EvmTransactionInput): RenderResult | null {
    const sel = selectorOf(tx.data)
    if (sel === TRANSFER) return this.renderTransfer(tx)
    if (sel === APPROVE) return this.renderApprove(tx)
    return null
  }

  private renderTransfer(tx: EvmTransactionInput): RenderResult | null {
    const decoded = this.decoder.decodeWithSignature(tx.data, 'transfer(address,uint256)')
    if (!decoded) return null
    const to = paramAddress(decoded, 0)
    const amountRaw = paramUint(decoded, 1)
    if (to === null || amountRaw === null) return null
    const token = lookupKnownToken(tx.chainId, tx.to)
    const amountRow = token
      ? { value: formatAmount(amountRaw, token.decimals, token.symbol) }
      : { valueKey: 'evm-decoder.amount-raw-note', valueParams: { value: amountRaw.toString() }, value: amountRaw.toString(), rawValue: amountRaw.toString() }
    return {
      type: 'erc20-transfer',
      // The selector alone proves nothing about the contract: only a curated token is 'high'.
      confidence: token ? 'high' : 'medium',
      functionNameKey: 'evm-decoder.fn-token-transfer',
      rows: [
        { labelKey: 'evm-decoder.function-label', valueKey: 'evm-decoder.fn-token-transfer', value: 'Token Transfer', type: 'text' },
        contractRow(tx),
        { labelKey: 'evm-decoder.to-label', value: to, type: 'address' },
        { labelKey: 'evm-decoder.amount-label', type: 'amount', ...amountRow }
      ],
      rawCalldata: tx.data
    }
  }

  private renderApprove(tx: EvmTransactionInput): RenderResult | null {
    const decoded = this.decoder.decodeWithSignature(tx.data, 'approve(address,uint256)')
    if (!decoded) return null
    const spender = paramAddress(decoded, 0)
    const amountRaw = paramUint(decoded, 1)
    if (spender === null || amountRaw === null) return null
    const token = lookupKnownToken(tx.chainId, tx.to)
    const unlimited = isUnlimitedApproval(amountRaw)
    const amountRow = unlimited
      ? { valueKey: 'evm-decoder.amount-unlimited', value: 'Unlimited' }
      : token
      ? { value: formatAmount(amountRaw, token.decimals, token.symbol) }
      : { valueKey: 'evm-decoder.amount-raw-note', valueParams: { value: amountRaw.toString() }, value: amountRaw.toString(), rawValue: amountRaw.toString() }
    return {
      type: 'erc20-approve',
      confidence: token ? 'high' : 'medium',
      functionNameKey: 'evm-decoder.fn-token-approval',
      rows: [
        { labelKey: 'evm-decoder.function-label', valueKey: 'evm-decoder.fn-token-approval', value: 'Token Approval', type: 'text' },
        contractRow(tx),
        { labelKey: 'evm-decoder.spender-label', value: spender, type: 'address' },
        { labelKey: 'evm-decoder.amount-label', type: unlimited ? 'warning' : 'amount', ...amountRow }
      ],
      warningKey: 'evm-decoder.approval-warning',
      rawCalldata: tx.data
    }
  }
}

export function paramAddress(d: DecodedCall, i: number): string | null {
  const v = d.params[i]?.value
  return v && v.kind === 'address' ? v.value : null
}

export function paramUint(d: DecodedCall, i: number): bigint | null {
  const v = d.params[i]?.value
  return v && v.kind === 'uint' ? v.value : null
}
