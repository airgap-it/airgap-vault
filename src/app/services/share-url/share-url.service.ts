import { flattened, SerializerService } from '@airgap/angular-core'
import {
  AccountShareResponse,
  AirGapWallet,
  AirGapWalletStatus,
  generateId,
  IACMessageDefinitionObject,
  IACMessageType
} from '@airgap/coinlib-core'
import { Injectable } from '@angular/core'

import { Secret } from '../../models/secret'
import { serializedDataToUrlString } from '../../utils/utils'
import { SecretsService } from '../secrets/secrets.service'

@Injectable({
  providedIn: 'root'
})
export class ShareUrlService {
  constructor(private readonly serializerService: SerializerService, private readonly secretsService: SecretsService) {
    //
  }

  public async generateShareWalletURL(wallet: AirGapWallet): Promise<IACMessageDefinitionObject> {
    const secret: Secret | undefined = this.secretsService.findByPublicKey(wallet.publicKey)

    const accountShareResponse: AccountShareResponse = {
      publicKey: wallet.publicKey,
      isExtendedPublicKey: wallet.isExtendedPublicKey,
      derivationPath: wallet.derivationPath,
      masterFingerprint: wallet.masterFingerprint,
      isActive: wallet.status === AirGapWalletStatus.ACTIVE,
      groupId: secret.fingerprint ?? '',
      groupLabel: secret.label ?? ''
    }

    const deserializedTxSigningRequest: IACMessageDefinitionObject = {
      id: generateId(10),
      protocol: wallet.protocol.identifier,
      type: IACMessageType.AccountShareResponse,
      payload: accountShareResponse
    }

    // const serializedTx: string | string[] = await this.serializerService.serialize([deserializedTxSigningRequest])

    return deserializedTxSigningRequest // serializedDataToUrlString(serializedTx, 'airgap-wallet://')
  }

  public async generateShareSecretsURL(secrets: Secret[]): Promise<string> {
    const deserializedTxSigningRequests: IACMessageDefinitionObject[] = flattened(
      secrets.map((secret: Secret) => {
        return secret.wallets
          .filter((wallet: AirGapWallet) => wallet.status !== AirGapWalletStatus.DELETED)
          .map((wallet: AirGapWallet) => {
            const accountShareResponse: AccountShareResponse = {
              publicKey: wallet.publicKey,
              isExtendedPublicKey: wallet.isExtendedPublicKey,
              derivationPath: wallet.derivationPath,
              masterFingerprint: wallet.masterFingerprint,
              isActive: wallet.status === AirGapWalletStatus.ACTIVE,
              groupId: secret.fingerprint,
              groupLabel: secret.label
            }

            return {
              id: generateId(10),
              protocol: wallet.protocol.identifier,
              type: IACMessageType.AccountShareResponse,
              payload: accountShareResponse
            }
          })
      })
    )

    const serializedTx: string | string[] = await this.serializerService.serialize(deserializedTxSigningRequests)

    return serializedDataToUrlString(serializedTx, 'airgap-wallet://')
  }
}
