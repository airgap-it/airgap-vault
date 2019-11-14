import { Injectable } from '@angular/core'
import {
  addSubProtocol,
  addSupportedProtocol,
  GenericERC20,
  GenericERC20Configuration,
  IAirGapTransaction,
  SignedTransaction,
  TezosKtProtocol,
  UnsignedTransaction
} from 'airgap-coin-lib'
import { AeternityERC20Token } from 'airgap-coin-lib/dist/protocols/ethereum/erc20/AeToken'

import { tokens } from './tokens'
export interface Token {
  symbol: string
  name: string
  marketSymbol: string
  identifier: string
  contractAddress: string
  decimals: number
}

interface SubProtocolInfo {
  symbol: string
  name: string
  marketSymbol: string

  identifier: string
  data: [string]
}

interface SubAccount {
  protocol: string
  subProtocols: GenericERC20Configuration[]
}

@Injectable({
  providedIn: 'root'
})
export class ProtocolsService {
  public subProtocols: SubAccount[] = [
    {
      protocol: 'eth',
      subProtocols: [
        {
          symbol: 'AE-ERC20',
          name: 'æternity Ethereum Token',
          marketSymbol: 'ae',
          identifier: 'eth-erc20-ae',
          contractAddress: '0x5ca9a71b1d01849c0a95490cc00559717fcf0d1d',
          decimals: 18
        }
      ]
    }
  ]

  constructor() {
    /* */
  }

  public addProtocols() {
    addSupportedProtocol(AeternityERC20Token)
    addSubProtocol('xtz', new TezosKtProtocol())

    this.subProtocols.forEach(supportedSubAccount => {
      supportedSubAccount.subProtocols.forEach(subProtocol => {
        addSubProtocol(
          supportedSubAccount.protocol,
          new GenericERC20({
            symbol: subProtocol.symbol,
            name: subProtocol.name,
            marketSymbol: subProtocol.marketSymbol,
            identifier: subProtocol.identifier,
            contractAddress: subProtocol.contractAddress,
            decimals: subProtocol.decimals
          })
        )
      })
    })

    tokens.forEach(token => {
      addSubProtocol(
        'eth',
        new GenericERC20({
          symbol: token.symbol,
          name: token.name,
          marketSymbol: token.marketSymbol,
          identifier: token.identifier,
          contractAddress: token.contractAddress,
          decimals: token.decimals
        })
      )
    })
  }

  public async getTokenTransferDetailsFromSigned(
    tx: IAirGapTransaction,
    signedTransaction: SignedTransaction
  ): Promise<IAirGapTransaction> {
    const subtoken: Token | undefined = tokens.find((token: Token) => token.contractAddress.toLowerCase() === tx.to[0].toLowerCase())
    if (subtoken) {
      const genericErc20: GenericERC20 = new GenericERC20(subtoken)

      const transactions: IAirGapTransaction[] = await genericErc20.getTransactionDetailsFromSigned(signedTransaction)

      if (transactions.length !== 1) {
        throw Error('TokenTransferDetails returned more than 1 transaction!')
      }

      return transactions[0]
    }

    return tx
  }

  public async getTokenTransferDetails(tx: IAirGapTransaction, unsignedTransaction: UnsignedTransaction): Promise<IAirGapTransaction> {
    const subtoken: Token | undefined = tokens.find((token: Token) => token.contractAddress.toLowerCase() === tx.to[0].toLowerCase())
    if (subtoken) {
      const genericErc20: GenericERC20 = new GenericERC20(subtoken)

      const transactions: IAirGapTransaction[] = await genericErc20.getTransactionDetails(unsignedTransaction)

      if (transactions.length !== 1) {
        throw Error('TokenTransferDetails returned more than 1 transaction!')
      }

      return transactions[0]
    }

    return tx
  }
}
