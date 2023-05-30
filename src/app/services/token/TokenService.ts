import { createV0EthereumERC20Token, ICoinSubProtocolAdapter } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import { IAirGapTransaction, SignedTransaction, UnsignedTransaction } from '@airgap/coinlib-core'
import { ERC20Token, ERC20TokenMetadata, erc20Tokens } from '@airgap/ethereum'

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  public async getTokenTransferDetailsFromSigned(
    tx: IAirGapTransaction,
    signedTransaction: SignedTransaction
  ): Promise<IAirGapTransaction> {
    const token: ERC20TokenMetadata | undefined = Object.values(erc20Tokens).find((token: ERC20TokenMetadata) => token.contractAddress.toLowerCase() === tx.to[0].toLowerCase())
    if (token) {
      const genericErc20: ICoinSubProtocolAdapter<ERC20Token> = await createV0EthereumERC20Token(token)

      const transactions: IAirGapTransaction[] = await genericErc20.getTransactionDetailsFromSigned(signedTransaction)

      if (transactions.length !== 1) {
        throw Error('TokenTransferDetails returned more than 1 transaction!')
      }

      return transactions[0]
    }

    return tx
  }

  public async getTokenTransferDetails(tx: IAirGapTransaction, unsignedTransaction: UnsignedTransaction): Promise<IAirGapTransaction> {
    const token: ERC20TokenMetadata | undefined = Object.values(erc20Tokens).find((token: ERC20TokenMetadata) => token.contractAddress.toLowerCase() === tx.to[0].toLowerCase())
    if (token) {
      const genericErc20: ICoinSubProtocolAdapter<ERC20Token> = await createV0EthereumERC20Token(token)

      const transactions: IAirGapTransaction[] = await genericErc20.getTransactionDetails(unsignedTransaction)

      if (transactions.length !== 1) {
        throw Error('TokenTransferDetails returned more than 1 transaction!')
      }

      return transactions[0]
    }

    return tx
  }
}
