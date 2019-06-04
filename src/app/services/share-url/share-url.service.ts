import { Injectable } from '@angular/core'
import { AirGapWallet, DeserializedSyncProtocol, EncodedType, SyncProtocolUtils, SyncWalletRequest } from 'airgap-coin-lib'

@Injectable({
  providedIn: 'root'
})
export class ShareUrlService {
  constructor() {
    //
  }

  async generateShareURL(wallet: AirGapWallet): Promise<string> {
    const syncProtocol = new SyncProtocolUtils()

    const syncWalletRequest: SyncWalletRequest = {
      publicKey: wallet.publicKey,
      isExtendedPublicKey: wallet.isExtendedPublicKey,
      derivationPath: wallet.derivationPath
    }

    const deserializedTxSigningRequest: DeserializedSyncProtocol = {
      version: 1,
      protocol: wallet.protocolIdentifier,
      type: EncodedType.WALLET_SYNC,
      payload: syncWalletRequest
    }

    const serializedTx = await syncProtocol.serialize(deserializedTxSigningRequest)

    return `airgap-wallet://?d=${serializedTx}`
  }
}
