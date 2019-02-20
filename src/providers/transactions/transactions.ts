import { Injectable } from '@angular/core'
import { Transaction } from '../../models/transaction.model'
import { AirGapWallet } from 'airgap-coin-lib'

@Injectable()
export class TransactionsProvider {
  async constructFromPayload(txObj: any, wallet: AirGapWallet): Promise<Transaction> {
    const tx = new Transaction()
    tx.publicKey = wallet.publicKey
    tx.protocolIdentifier = wallet.protocolIdentifier

    const airGapTx = await wallet.coinProtocol.getTransactionDetails(txObj)

    tx.from = airGapTx.from
    tx.to = airGapTx.to
    tx.amount = airGapTx.amount
    tx.fee = airGapTx.fee
    tx.payload = txObj

    return tx
  }
}
