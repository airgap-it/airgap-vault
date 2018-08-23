import { Injectable } from '@angular/core'
import { Transaction } from '../../models/transaction.model'
import { TransactionsProvider } from '../transactions/transactions'
import { SecretsProvider } from '../secrets/secrets.provider'

@Injectable()
export class AirGapSchemeProvider {

  constructor(private secretsProvider: SecretsProvider, private transactionProvider: TransactionsProvider) {

  }

  extractAirGapTx(qr: string): Transaction {
    if (qr.indexOf('?data=') !== -1) {
      qr = qr.split('?data=')[1]
    }

    const json = JSON.parse(atob(qr))
    const wallet = this.secretsProvider.findWalletByPublicKeyAndProtocolIdentifier(json.publicKey, json.protocolIdentifier)
    const payload = json.payload

    return this.transactionProvider.constructFromPayload(payload, wallet)
  }

}
