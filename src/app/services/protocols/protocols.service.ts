import { Injectable } from '@angular/core'
import {
  addSubProtocol,
  GenericERC20,
  IAirGapTransaction,
  TezosKtProtocol,
  UnsignedTransaction,
  addSupportedProtocol,
  AeternityProtocol,
  BitcoinProtocol,
  EthereumProtocol,
  GroestlcoinProtocol,
  TezosProtocol,
  CosmosProtocol,
  PolkadotProtocol,
  KusamaProtocol,
  EthereumERC20ProtocolOptions,
  EthereumProtocolNetwork,
  EthereumERC20ProtocolConfig,
  getProtocolByIdentifier,
  SignedTransaction,
  TezosUSD
} from 'airgap-coin-lib'
import { TezosBTC } from 'airgap-coin-lib/dist/protocols/tezos/fa/TezosBTC'

import { tokens } from './tokens'
import { SubProtocolSymbols, ProtocolSymbols } from 'airgap-coin-lib/dist/utils/ProtocolSymbols'

export interface Token {
  symbol: string
  name: string
  marketSymbol: string
  identifier: string
  contractAddress: string
  decimals: number
}

interface SubAccount {
  protocol: ProtocolSymbols
  subProtocols: Token[]
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
    addSupportedProtocol(new AeternityProtocol())
    addSupportedProtocol(new BitcoinProtocol())
    addSupportedProtocol(new EthereumProtocol())
    addSupportedProtocol(new GroestlcoinProtocol())
    addSupportedProtocol(new TezosProtocol())
    addSupportedProtocol(new CosmosProtocol())
    addSupportedProtocol(new PolkadotProtocol())
    addSupportedProtocol(new KusamaProtocol())

    addSubProtocol(new TezosProtocol(), new TezosKtProtocol())
    addSubProtocol(new TezosProtocol(), new TezosBTC())
    addSubProtocol(new TezosProtocol(), new TezosUSD())

    this.subProtocols.forEach((supportedSubAccount) => {
      supportedSubAccount.subProtocols.forEach((subProtocol) => {
        const protocol = getProtocolByIdentifier(supportedSubAccount.protocol)
        addSubProtocol(
          protocol,
          new GenericERC20(
            new EthereumERC20ProtocolOptions(
              new EthereumProtocolNetwork(),
              new EthereumERC20ProtocolConfig(
                subProtocol.symbol,
                subProtocol.name,
                subProtocol.marketSymbol,
                subProtocol.identifier as SubProtocolSymbols,
                subProtocol.contractAddress,
                subProtocol.decimals
              )
            )
          )
        )
      })
    })

    tokens.forEach((token) => {
      addSubProtocol(
        new EthereumProtocol(),
        new GenericERC20(
          new EthereumERC20ProtocolOptions(
            new EthereumProtocolNetwork(),
            new EthereumERC20ProtocolConfig(
              token.symbol,
              token.name,
              token.marketSymbol,
              token.identifier as SubProtocolSymbols,
              token.contractAddress,
              token.decimals
            )
          )
        )
      )
    })
  }

  public async getTokenTransferDetailsFromSigned(
    tx: IAirGapTransaction,
    signedTransaction: SignedTransaction
  ): Promise<IAirGapTransaction> {
    const subtoken: Token | undefined = tokens.find((token: Token) => token.contractAddress.toLowerCase() === tx.to[0].toLowerCase())
    if (subtoken) {
      const genericErc20: GenericERC20 = new GenericERC20(
        new EthereumERC20ProtocolOptions(
          new EthereumProtocolNetwork(),
          new EthereumERC20ProtocolConfig(
            subtoken.symbol,
            subtoken.name,
            subtoken.marketSymbol,
            subtoken.identifier as SubProtocolSymbols,
            subtoken.contractAddress,
            subtoken.decimals
          )
        )
      )

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
      const genericErc20: GenericERC20 = new GenericERC20(
        new EthereumERC20ProtocolOptions(
          new EthereumProtocolNetwork(),
          new EthereumERC20ProtocolConfig(
            subtoken.symbol,
            subtoken.name,
            subtoken.marketSymbol,
            subtoken.identifier as SubProtocolSymbols,
            subtoken.contractAddress,
            subtoken.decimals
          )
        )
      )

      const transactions: IAirGapTransaction[] = await genericErc20.getTransactionDetails(unsignedTransaction)

      if (transactions.length !== 1) {
        throw Error('TokenTransferDetails returned more than 1 transaction!')
      }

      return transactions[0]
    }

    return tx
  }
}
