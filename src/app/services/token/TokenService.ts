import { ethTokens, Token } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import {
  EthereumERC20ProtocolConfig,
  EthereumERC20ProtocolOptions,
  EthereumProtocolNetwork,
  GenericERC20,
  GenericRskERC20,
  RskProtocolNetwork,
  RskERC20ProtocolConfig,
  RskERC20ProtocolOptions,
  IAirGapTransaction,
  SignedTransaction,
  UnsignedTransaction
} from '@airgap/coinlib-core'
import { SubProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  public async getTokenTransferDetailsFromSigned(
    tx: IAirGapTransaction,
    signedTransaction: SignedTransaction
  ): Promise<IAirGapTransaction> {
    const token: Token | undefined = ethTokens.find((token: Token) => token.contractAddress.toLowerCase() === tx.to[0].toLowerCase())
    if (token) {
      const genericErc20: GenericERC20 = new GenericERC20(
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

      const genericRskERC20: GenericRskERC20 = new GenericRskERC20(
        new RskERC20ProtocolOptions(
          new RskProtocolNetwork(),
          new RskERC20ProtocolConfig(
            token.symbol,
            token.name,
            token.marketSymbol,
            token.identifier as SubProtocolSymbols,
            token.contractAddress,
            token.decimals
          )
        )
      )

      const ethTransactions: IAirGapTransaction[] = await genericErc20.getTransactionDetailsFromSigned(signedTransaction)
      const rskTransactions: IAirGapTransaction[] = await genericRskERC20.getTransactionDetailsFromSigned(signedTransaction)
      const transactions: IAirGapTransaction[] = ethTransactions.concat(rskTransactions)

      if (transactions.length !== 1) {
        throw Error('TokenTransferDetails returned more than 1 transaction!')
      }

      return transactions[0]
    }

    return tx
  }

  public async getTokenTransferDetails(tx: IAirGapTransaction, unsignedTransaction: UnsignedTransaction): Promise<IAirGapTransaction> {
    const token: Token | undefined = ethTokens.find((token: Token) => token.contractAddress.toLowerCase() === tx.to[0].toLowerCase())
    if (token) {
      const genericErc20: GenericERC20 = new GenericERC20(
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

      const genericRskERC20: GenericRskERC20 = new GenericRskERC20(
        new RskERC20ProtocolOptions(
          new RskProtocolNetwork(),
          new RskERC20ProtocolConfig(
            token.symbol,
            token.name,
            token.marketSymbol,
            token.identifier as SubProtocolSymbols,
            token.contractAddress,
            token.decimals
          )
        )
      )

      const ethTransactions: IAirGapTransaction[] = await genericErc20.getTransactionDetails(unsignedTransaction)
      const rskTransactions: IAirGapTransaction[] = await genericRskERC20.getTransactionDetails(unsignedTransaction)
      const transactions: IAirGapTransaction[] = ethTransactions.concat(rskTransactions)

      if (transactions.length !== 1) {
        throw Error('TokenTransferDetails returned more than 1 transaction!')
      }

      return transactions[0]
    }

    return tx
  }
}
