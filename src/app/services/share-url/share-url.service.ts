import { flattened } from '@airgap/angular-core'
import { AirGapWallet, AirGapWalletStatus } from '@airgap/coinlib-core'
import { IACMessageDefinitionObjectV3, generateId, IACMessageType, AccountShareResponse } from '@airgap/serializer'

import { Injectable } from '@angular/core'

import { MnemonicSecret } from '../../models/secret'
import { SecretsService } from '../secrets/secrets.service'

@Injectable({
  providedIn: 'root'
})
export class ShareUrlService {
  constructor(private readonly secretsService: SecretsService) {
    //
  }

  public async generateShareWalletURL(wallet: AirGapWallet): Promise<IACMessageDefinitionObjectV3[]> {
    const secret: MnemonicSecret | undefined = this.secretsService.findByPublicKey(wallet.publicKey)

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
      protocol: await wallet.protocol.getIdentifier(),
      type: IACMessageType.AccountShareResponse,
      payload: accountShareResponse
    }

    if (deserializedTxSigningRequest.type === IACMessageType.AccountShareResponse) {
      deserializedTxSigningRequest.payload
    }

    return [deserializedTxSigningRequest]
  }

  public async generateShareSecretsURL(secrets: MnemonicSecret[]): Promise<IACMessageDefinitionObjectV3[]> {
    const deserializedTxSigningRequests: IACMessageDefinitionObjectV3[] = flattened(
      await Promise.all(
        secrets.map((secret: MnemonicSecret) => {
          return Promise.all(
            secret.wallets
              .filter((wallet: AirGapWallet) => wallet.status !== AirGapWalletStatus.DELETED)
              .map(async (wallet: AirGapWallet) => {
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
                  protocol: await wallet.protocol.getIdentifier(),
                  type: IACMessageType.AccountShareResponse,
                  payload: accountShareResponse
                }
              })
          )
        })
      )
    )

    return deserializedTxSigningRequests
  }
}
