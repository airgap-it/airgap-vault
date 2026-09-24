export interface KnownToken {
  chainId: number
  address: string
  symbol: string
  decimals: number
}

const TOKENS: KnownToken[] = [
  // Ethereum mainnet
  { chainId: 1, address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC', decimals: 6 },
  { chainId: 1, address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT', decimals: 6 },
  { chainId: 1, address: '0x6b175474e89094c44da98b954eedeac495271d0f', symbol: 'DAI', decimals: 18 },
  { chainId: 1, address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', symbol: 'WETH', decimals: 18 },
  { chainId: 1, address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', symbol: 'WBTC', decimals: 8 },
  { chainId: 1, address: '0x514910771af9ca656af840dff83e8264ecf986ca', symbol: 'LINK', decimals: 18 },
  { chainId: 1, address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', symbol: 'UNI', decimals: 18 },
  // Optimism
  { chainId: 10, address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85', symbol: 'USDC', decimals: 6 },
  { chainId: 10, address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', symbol: 'USDT', decimals: 6 },
  { chainId: 10, address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', symbol: 'DAI', decimals: 18 },
  { chainId: 10, address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', decimals: 18 },
  // Base
  { chainId: 8453, address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', symbol: 'USDC', decimals: 6 },
  { chainId: 8453, address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', decimals: 18 },
  // BNB Chain
  { chainId: 56, address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', symbol: 'USDC', decimals: 18 },
  { chainId: 56, address: '0x55d398326f99059ff775485246999027b3197955', symbol: 'USDT', decimals: 18 },
  { chainId: 56, address: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3', symbol: 'DAI', decimals: 18 },
  { chainId: 56, address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', symbol: 'WBNB', decimals: 18 }
]

const INDEX = new Map<string, KnownToken>()
for (const t of TOKENS) INDEX.set(`${t.chainId}:${t.address.toLowerCase()}`, t)

export function lookupKnownToken(chainId: number | undefined, address: string | undefined): KnownToken | null {
  if (!address) return null
  if (chainId === undefined) {
    for (const t of TOKENS) if (t.address.toLowerCase() === address.toLowerCase()) return t
    return null
  }
  return INDEX.get(`${chainId}:${address.toLowerCase()}`) || null
}

export function formatAmount(raw: bigint, decimals: number, symbol?: string): string {
  if (decimals === 0) return symbol ? `${raw.toString()} ${symbol}` : raw.toString()
  const base = 10n ** BigInt(decimals)
  const whole = raw / base
  const frac = raw % base
  let fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '')
  if (fracStr.length > 8) fracStr = fracStr.slice(0, 8)
  const out = fracStr ? `${whole.toString()}.${fracStr}` : whole.toString()
  return symbol ? `${out} ${symbol}` : out
}

export function isUnlimitedApproval(v: bigint): boolean {
  return v === (1n << 256n) - 1n
}

export interface KnownContract {
  /** Omit for contracts deployed at the same (CREATE2-deterministic) address on every chain. */
  chainId?: number
  address: string
  name: string
}

// Curated, strictly-local list of well-known protocol contracts. Keep it small and
// reviewable. Addresses are lowercased. SECURITY: every entry must be independently
// verified before it is added — a wrong address→name mapping is a phishing vector,
// and the raw address is always shown alongside the name (a name is a hint, not proof).
const CONTRACTS: KnownContract[] = [
  // Same address on every chain (CREATE2 / deterministic deployers)
  { address: '0x000000000022d473030f116ddee9f6b43ac78ba3', name: 'Uniswap: Permit2' },
  { address: '0xca11bde05977b3631167028862be2a173976ca11', name: 'Multicall3' },
  { address: '0xa6b71e26c5e0845f74c812102ca7114b6a896ab2', name: 'Safe: Proxy Factory 1.3.0' },
  { address: '0xd9db270c1b5e3bd161e8c8503c55ceabee709552', name: 'Safe: Singleton 1.3.0' },
  { address: '0x3e5c63644e683549055b9be8653de26e0b4cd36e', name: 'Safe: Singleton L2 1.3.0' },
  // Ethereum mainnet
  { chainId: 1, address: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', name: 'Uniswap V2: Router 2' },
  { chainId: 1, address: '0xe592427a0aece92de3edee1f18e0157c05861564', name: 'Uniswap V3: Router' },
  { chainId: 1, address: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', name: 'Uniswap V3: Router 2' }
]

/**
 * Resolve a well-known, *locally curated* human name for an address — a token
 * symbol (USDC, WETH, …) or a protocol-contract name (Uniswap V2: Router 2, …).
 * Strictly offline; returns null for unknown addresses. Mirrors the chain-scoped
 * + no-chainId fallback behaviour of {@link lookupKnownToken}. The raw address
 * must always stay visible — a name is a hint, not a substitute, since
 * lookalike-contract scams exist.
 */
export function resolveAddressName(chainId: number | undefined, address: string | undefined): string | null {
  if (!address) return null
  const token = lookupKnownToken(chainId, address)
  if (token) return token.symbol
  const addr = address.toLowerCase()
  for (const c of CONTRACTS) {
    if (c.address === addr && (c.chainId === undefined || chainId === undefined || c.chainId === chainId)) {
      return c.name
    }
  }
  return null
}
