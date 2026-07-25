import BigNumber from 'bignumber.js'

type ERC20ParameterType = 'address' | 'uint256'

interface ERC20Method {
  name: string
  parameters: { name: string; type: ERC20ParameterType }[]
}

const KNOWN_ERC20_FUNC: { [selector: string]: ERC20Method } = {
  '095ea7b3': {
    name: 'approve',
    parameters: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ]
  },
  '23b872dd': {
    name: 'transferFrom',
    parameters: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ]
  },
  a9059cbb: {
    name: 'transfer',
    parameters: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ]
  }
}
const KNOWN_DECIMAL: { [token: string]: number } = { USDC: 6, USDT: 6, WETH: 18, rETH: 18 }
const KNOWN_TO_ADDR: { [address: string]: string } = {
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
  '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': 'USDC (POL)',
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH',
  '0xae78736cd615f374d3085123a210448e74fc6393': 'rETH'
}
const KNOWN_INNER_DEST: { [address: string]: string } = {
  '0x000000000022d473030f116ddee9f6b43ac78ba3': 'Uniswap Permit2 (ETH/POL)',
  '0xe592427a0aece92de3edee1f18e0157c05861564': 'Uniswap Router V3 (ETH/POL)',
  '0x66a9893cc07d91d95644aedd05d03f95e1dba8af': 'Uniswap Router V4 (ETH)',
  '0x4c82d1fbfe28c977cbb58d8c7ff8fcf9f70a2cca': 'Uniswap Router V4 (ETH)'
}

export function parseERC20Data(rawData: string, rawTo: string): [string, string] | undefined {
  const data: string = rawData.startsWith('0x') ? rawData.slice(2) : rawData
  const method: ERC20Method | undefined = KNOWN_ERC20_FUNC[data.slice(0, 8).toLowerCase()]
  const token: string | undefined = KNOWN_TO_ADDR[rawTo.toLowerCase()]
  if (!/^[0-9a-fA-F]+$/.test(data) || !/^0x[0-9a-fA-F]{40}$/.test(rawTo) || method === undefined) {
    return undefined
  }

  if (data.length !== 8 + method.parameters.length * 64) {
    return undefined
  }

  const args: string[] = []
  for (let index: number = 0; index < method.parameters.length; index++) {
    const parameter: { name: string; type: ERC20ParameterType } = method.parameters[index]
    const word: string = data.slice(8 + index * 64, 8 + (index + 1) * 64)
    const parsed: string | undefined = parseOnce(word, parameter, token)
    if (parsed === undefined) {
      return undefined
    }

    args.push(parsed)
  }

  return [`${method.name}(${args.join(', ')})`, `${token ?? 'Unknown ERC-20'} (${rawTo})`]
}

function parseOnce(
  word: string,
  parameter: { name: string; type: ERC20ParameterType },
  token?: string
): string | undefined {
  const value: string | undefined = parameter.type === 'address' ? formatAddress(word) : formatAmount(word, token)

  return value !== undefined ? `${parameter.name}: ${value}` : undefined
}

function formatAddress(word: string): string | undefined {
  if (!/^0{24}[0-9a-fA-F]{40}$/.test(word)) {
    return undefined
  }

  const address: string = `0x${word.slice(24)}`
  const name: string | undefined = KNOWN_INNER_DEST[address.toLowerCase()]

  return name !== undefined ? `${name} (${address})` : address
}

function formatAmount(word: string, token?: string): string | undefined {
  if (!/^[0-9a-fA-F]{64}$/.test(word)) {
    return undefined
  }

  const amount: BigNumber = new BigNumber(word, 16)
  if (amount.gt(new BigNumber(2).pow(255))) {
    return 'Infinite'
  }

  const decimal: number | undefined = token !== undefined ? KNOWN_DECIMAL[token.split(' ')[0]] : undefined
  return token !== undefined && decimal !== undefined
    ? `${amount.shiftedBy(-decimal).toFixed(decimal)} ${token}`
    : `${amount.toFixed()} raw units`
}