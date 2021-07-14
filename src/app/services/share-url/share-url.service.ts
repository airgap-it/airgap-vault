import { flattened } from '@airgap/angular-core'
import { AccountShareResponse, AirGapWallet, AirGapWalletStatus, IACMessageDefinitionObjectV3, IACMessageType } from '@airgap/coinlib-core'
import { generateId } from '@airgap/coinlib-core/serializer-v3/utils/generateId'

import { Injectable } from '@angular/core'

import { Secret } from '../../models/secret'
import { SecretsService } from '../secrets/secrets.service'

@Injectable({
  providedIn: 'root'
})
export class ShareUrlService {
  constructor(private readonly secretsService: SecretsService) {
    //
  }

  public async generateShareWalletURL(wallet: AirGapWallet): Promise<IACMessageDefinitionObjectV3[]> {
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

    const deserializedTxSigningRequest: IACMessageDefinitionObjectV3 = {
      id: generateId(8),
      protocol: wallet.protocol.identifier,
      type: IACMessageType.AccountShareResponse,
      payload: accountShareResponse
    }

    if (deserializedTxSigningRequest.type === IACMessageType.AccountShareResponse) {
      deserializedTxSigningRequest.payload
    }

    return [deserializedTxSigningRequest]
  }

  public async generateShareSecretsURL(secrets: Secret[]): Promise<IACMessageDefinitionObjectV3[]> {
    const deserializedTxSigningRequests: IACMessageDefinitionObjectV3[] = flattened(
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
              id: generateId(8),
              protocol: wallet.protocol.identifier,
              type: IACMessageType.AccountShareResponse,
              payload: accountShareResponse
            }
          })
      })
    )

    return deserializedTxSigningRequests
  }
}
