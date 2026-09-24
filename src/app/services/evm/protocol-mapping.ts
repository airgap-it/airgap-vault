import { MainProtocolSymbols, ProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core'

const EVM_MAIN: string[] = [
  MainProtocolSymbols.ETH,
  MainProtocolSymbols.OPTIMISM,
  MainProtocolSymbols.BASE,
  MainProtocolSymbols.BNB
]

const EVM_SUB: string[] = [
  SubProtocolSymbols.ETH_ERC20,
  SubProtocolSymbols.ETH_ERC20_XCHF,
  SubProtocolSymbols.OPTIMISM_ERC20,
  SubProtocolSymbols.BASE_ERC20,
  SubProtocolSymbols.BNB_ERC20
]

const CHAIN_ID: Record<string, number> = {
  [MainProtocolSymbols.ETH]: 1,
  [MainProtocolSymbols.OPTIMISM]: 10,
  [MainProtocolSymbols.BASE]: 8453,
  [MainProtocolSymbols.BNB]: 56,
  [SubProtocolSymbols.ETH_ERC20]: 1,
  [SubProtocolSymbols.ETH_ERC20_XCHF]: 1,
  [SubProtocolSymbols.OPTIMISM_ERC20]: 10,
  [SubProtocolSymbols.BASE_ERC20]: 8453,
  [SubProtocolSymbols.BNB_ERC20]: 56
}

export function isEvmProtocol(id: ProtocolSymbols | string | undefined): boolean {
  if (!id) return false
  return EVM_MAIN.includes(id) || EVM_SUB.includes(id)
}

export function isEvmSubProtocol(id: ProtocolSymbols | string | undefined): boolean {
  return !!id && EVM_SUB.includes(id)
}

export function chainIdForProtocol(id: ProtocolSymbols | string | undefined): number | undefined {
  if (!id) return undefined
  return CHAIN_ID[id]
}
