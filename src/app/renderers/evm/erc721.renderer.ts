import { AbiDecoderService } from '../../services/evm/abi-decoder.service'
import { EvmTransactionInput, RenderResult } from '../../services/evm/abi-types'
import { contractRow, selectorOf, TransactionRenderer } from './base.renderer'
import { paramAddress, paramUint } from './erc20.renderer'

const TRANSFER_FROM = '23b872dd'
const SAFE_TRANSFER_FROM = '42842e0e'
const SAFE_TRANSFER_FROM_DATA = 'b88d4fde'

/**
 * Selector 0x23b872dd is shared with ERC-20 transferFrom. We render with
 * `low` confidence and an explicit ambiguity warning rather than pretending
 * we know whether this is an NFT or a token amount.
 */
export class Erc721Renderer implements TransactionRenderer {
  constructor(private readonly decoder: AbiDecoderService) {}

  public matches(tx: EvmTransactionInput): boolean {
    const sel = selectorOf(tx.data)
    return sel === TRANSFER_FROM || sel === SAFE_TRANSFER_FROM || sel === SAFE_TRANSFER_FROM_DATA
  }

  public render(tx: EvmTransactionInput): RenderResult | null {
    const sel = selectorOf(tx.data)
    if (sel === TRANSFER_FROM) return this.renderAmbiguousTransferFrom(tx)
    if (sel === SAFE_TRANSFER_FROM) return this.renderSafeTransferFrom(tx, false)
    if (sel === SAFE_TRANSFER_FROM_DATA) return this.renderSafeTransferFrom(tx, true)
    return null
  }

  private renderAmbiguousTransferFrom(tx: EvmTransactionInput): RenderResult | null {
    const decoded = this.decoder.decodeWithSignature(tx.data, 'transferFrom(address,address,uint256)')
    if (!decoded) return null
    const from = paramAddress(decoded, 0)
    const to = paramAddress(decoded, 1)
    const third = paramUint(decoded, 2)
    if (from === null || to === null || third === null) return null
    return {
      type: 'erc721-transfer',
      confidence: 'low',
      functionNameKey: 'evm-decoder.fn-transferfrom-ambiguous',
      rows: [
        { labelKey: 'evm-decoder.function-label', valueKey: 'evm-decoder.fn-transferfrom-ambiguous', value: 'transferFrom', type: 'text' },
        contractRow(tx),
        { labelKey: 'evm-decoder.from-label', value: from, type: 'address' },
        { labelKey: 'evm-decoder.to-label', value: to, type: 'address' },
        { labelKey: 'evm-decoder.amount-or-token-id-label', value: third.toString(), type: 'amount' }
      ],
      warningKey: 'evm-decoder.transferfrom-ambiguous-warning',
      rawCalldata: tx.data
    }
  }

  private renderSafeTransferFrom(tx: EvmTransactionInput, withData: boolean): RenderResult | null {
    const sig = withData
      ? 'safeTransferFrom(address,address,uint256,bytes)'
      : 'safeTransferFrom(address,address,uint256)'
    const decoded = this.decoder.decodeWithSignature(tx.data, sig)
    if (!decoded) return null
    const from = paramAddress(decoded, 0)
    const to = paramAddress(decoded, 1)
    const tokenId = paramUint(decoded, 2)
    if (from === null || to === null || tokenId === null) return null
    return {
      type: 'erc721-transfer',
      confidence: 'high',
      functionNameKey: 'evm-decoder.fn-nft-transfer',
      rows: [
        { labelKey: 'evm-decoder.function-label', valueKey: 'evm-decoder.fn-nft-transfer', value: 'NFT Transfer', type: 'text' },
        contractRow(tx),
        { labelKey: 'evm-decoder.from-label', value: from, type: 'address' },
        { labelKey: 'evm-decoder.to-label', value: to, type: 'address' },
        { labelKey: 'evm-decoder.token-id-label', value: tokenId.toString(), type: 'text' }
      ],
      rawCalldata: tx.data
    }
  }
}
