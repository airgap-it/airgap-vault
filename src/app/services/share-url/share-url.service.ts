import { Injectable } from '@angular/core'
import { AccountShareResponse, AirGapWallet, IACMessageDefinitionObject, IACMessageType } from 'airgap-coin-lib'

import { SerializerService } from '../../services/serializer/serializer.service'
import { serializedDataToUrlString } from '../../utils/utils'

@Injectable({
  providedIn: 'root'
})
export class ShareUrlService {
  constructor(private readonly serializerService: SerializerService) {
    //
  }

  public async generateShareURL(wallet: AirGapWallet): Promise<string> {
    const accountShareResponse: AccountShareResponse = {
      publicKey: wallet.publicKey,
      isExtendedPublicKey: wallet.isExtendedPublicKey,
      derivationPath: wallet.derivationPath
    }

    const deserializedTxSigningRequest: IACMessageDefinitionObject = {
      protocol: wallet.protocol.identifier,
      type: IACMessageType.AccountShareResponse,
      payload: accountShareResponse
    }

    const serializedTx: string[] = await this.serializerService.serialize([deserializedTxSigningRequest])

    return serializedDataToUrlString(serializedTx, 'airgap-wallet://')
  }
}
