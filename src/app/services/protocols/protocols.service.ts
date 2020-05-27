import { Injectable } from '@angular/core'
import {
  addSubProtocol,
  GenericERC20,
  GenericERC20Configuration,
  IAirGapTransaction,
  SignedTransaction,
  TezosKtProtocol,
  UnsignedTransaction,
  TezosStaker
} from 'airgap-coin-lib'
import { TezosBTC } from 'airgap-coin-lib/dist/protocols/tezos/fa/TezosBTC'

import { tokens } from './tokens'
export interface Token {
  symbol: string
  name: string
  marketSymbol: string
  identifier: string
  contractAddress: string
  decimals: number
}

interface SubAccount {
  protocol: string
  subProtocols: GenericERC20Configuration[]
}

@Injectable({
  providedIn: 'root'
})
export class ProtocolsService {
  public subProtocols: SubAccount[] = []

  constructor() {
    /* */
  }

  public addProtocols() {
    addSubProtocol('xtz', new TezosKtProtocol())
    addSubProtocol('xtz', new TezosBTC())
    addSubProtocol('xtz', new TezosStaker())

    this.subProtocols.forEach((supportedSubAccount) => {
      supportedSubAccount.subProtocols.forEach((subProtocol) => {
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

    tokens.forEach((token) => {
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
