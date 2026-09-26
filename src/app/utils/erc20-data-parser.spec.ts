import { parseERC20Data } from './erc20-data-parser'

/* This file is just for unit-test. */
describe('ERC20 data parser', () => {
  const address: string = '0000000000000000000000005f57ed965700eb8693c1ecf0b3682115939bb1fe'
  const amount: string = '00000000000000000000000000000000000000000000000000000000000f4240'
  const usdc: string = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
  const usdt: string = '0xdac17f958d2ee523a2206206994597c13d831ec7'

  it('parses transfer data', () => {
    expect(parseERC20Data(`0xa9059cbb${address}${amount}`, usdc)).toEqual([
      'transfer(to: 0x5f57ed965700eb8693c1ecf0b3682115939bb1fe, amount: 1.000000 USDC)',
      `USDC (${usdc})`
    ])
  })

  it('uses USDC decimals for Polygon USDC', () => {
    const polygonUsdc: string = '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359'
    expect(parseERC20Data(`0xa9059cbb${address}${amount}`, polygonUsdc)).toEqual([
      'transfer(to: 0x5f57ed965700eb8693c1ecf0b3682115939bb1fe, amount: 1.000000 USDC (POL))',
      `USDC (POL) (${polygonUsdc})`
    ])
  })

  it('parses approve data', () => {
    expect(parseERC20Data(`095ea7b3${address}${amount}`, usdt)).toEqual([
      'approve(spender: 0x5f57ed965700eb8693c1ecf0b3682115939bb1fe, amount: 1.000000 USDT)',
      `USDT (${usdt})`
    ])
  })

  it('identifies effectively infinite amounts', () => {
    expect(parseERC20Data(`095ea7b3${address}${'f'.repeat(64)}`, usdt)).toEqual([
      'approve(spender: 0x5f57ed965700eb8693c1ecf0b3682115939bb1fe, amount: Infinite)',
      `USDT (${usdt})`
    ])
    expect(parseERC20Data(`a9059cbb${address}${'f'.repeat(64)}`, usdt)).toEqual([
      'transfer(to: 0x5f57ed965700eb8693c1ecf0b3682115939bb1fe, amount: Infinite)',
      `USDT (${usdt})`
    ])
  })

  it('parses transferFrom data', () => {
    expect(parseERC20Data(`23b872dd${address}${address}${amount}`, usdc)).toEqual([
      'transferFrom(from: 0x5f57ed965700eb8693c1ecf0b3682115939bb1fe, to: 0x5f57ed965700eb8693c1ecf0b3682115939bb1fe, amount: 1.000000 USDC)',
      `USDC (${usdc})`
    ])
  })

  it('parses known 18-decimal tokens', () => {
    const weth: string = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    const oneWeth: string = '0000000000000000000000000000000000000000000000000de0b6b3a7640000'
    expect(parseERC20Data(`a9059cbb${address}${oneWeth}`, weth)).toEqual([
      'transfer(to: 0x5f57ed965700eb8693c1ecf0b3682115939bb1fe, amount: 1.000000000000000000 WETH)',
      `WETH (${weth})`
    ])
  })

  it('labels known inner destinations without hiding their address', () => {
    const permit2: string = '000000000000000000000000000000000022d473030f116ddee9f6b43ac78ba3'
    expect(parseERC20Data(`095ea7b3${permit2}${amount}`, usdc)).toEqual([
      'approve(spender: Uniswap Permit2 (0x000000000022d473030f116ddee9f6b43ac78ba3), amount: 1.000000 USDC)',
      `USDC (${usdc})`
    ])
  })

  it('does not parse unknown or malformed data', () => {
    expect(parseERC20Data('0xdeadbeef', usdc)).toBeUndefined()
    expect(parseERC20Data(`0xa9059cbb${address}${amount}`, '0xunknown')).toBeUndefined()
    expect(parseERC20Data(`0xa9059cbb${address}${amount}00`, usdc)).toBeUndefined()
    expect(parseERC20Data(`0xa9059cbb${'1'.repeat(64)}${amount}`, usdc)).toBeUndefined()
  })

  it('keeps exact units for an unknown token contract', () => {
    const unknown: string = '0x3c0000000000000000000000000000000000d8cc'
    expect(parseERC20Data(`0xa9059cbb${address}${amount}`, unknown)).toEqual([
      'transfer(to: 0x5f57ed965700eb8693c1ecf0b3682115939bb1fe, amount: 1000000 raw units)',
      `Unknown ERC-20 (${unknown})`
    ])
  })
})