import { formatAmount, isUnlimitedApproval, lookupKnownToken, resolveAddressName } from './known-tokens'

describe('known-tokens', () => {
  it('looks up USDC on Ethereum', () => {
    const t = lookupKnownToken(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
    expect(t).not.toBeNull()
    expect(t!.symbol).toBe('USDC')
    expect(t!.decimals).toBe(6)
  })

  it('returns null for unknown token', () => {
    expect(lookupKnownToken(1, '0x0000000000000000000000000000000000000000')).toBeNull()
  })

  it('returns null when address is missing', () => {
    expect(lookupKnownToken(1, undefined)).toBeNull()
  })

  it('formats amount with decimals', () => {
    expect(formatAmount(1500000n, 6, 'USDC')).toBe('1.5 USDC')
    expect(formatAmount(1000000000000000000n, 18, 'ETH')).toBe('1 ETH')
    expect(formatAmount(0n, 18, 'ETH')).toBe('0 ETH')
  })

  it('detects unlimited approval', () => {
    expect(isUnlimitedApproval((1n << 256n) - 1n)).toBe(true)
    expect(isUnlimitedApproval(0n)).toBe(false)
  })

  describe('resolveAddressName', () => {
    const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    const UNIV2 = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
    const PERMIT2 = '0x000000000022D473030F116dDEE9F6B43aC78BA3'

    it('resolves a chain-scoped token to its symbol', () => {
      expect(resolveAddressName(1, USDC)).toBe('USDC')
    })

    it('resolves a chain-specific contract to its name', () => {
      expect(resolveAddressName(1, UNIV2)).toBe('Uniswap V2: Router 2')
    })

    it('resolves a cross-chain (CREATE2) contract on any chain', () => {
      expect(resolveAddressName(1, PERMIT2)).toBe('Uniswap: Permit2')
      expect(resolveAddressName(8453, PERMIT2)).toBe('Uniswap: Permit2')
    })

    it('does not resolve a chain-specific contract on the wrong chain', () => {
      expect(resolveAddressName(8453, UNIV2)).toBeNull() // Uniswap V2 Router 2 entry is mainnet-only
    })

    it('returns null for an unknown address', () => {
      expect(resolveAddressName(1, '0x000000000000000000000000000000000000dead')).toBeNull()
    })

    it('falls back to a chain-agnostic match when chainId is undefined', () => {
      expect(resolveAddressName(undefined, USDC)).toBe('USDC')
      expect(resolveAddressName(undefined, UNIV2)).toBe('Uniswap V2: Router 2')
    })

    it('returns null when the address is missing', () => {
      expect(resolveAddressName(1, undefined)).toBeNull()
    })
  })
})
