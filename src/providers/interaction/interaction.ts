import { Secret } from './../../models/secret'
import { Injectable } from '@angular/core'
import { Storage } from '@ionic/storage'
import { SecretsProvider } from '../secrets/secrets.provider'

@Injectable()
export class InteractionProvider {
  constructor(private storage: Storage, private secrets: SecretsProvider) {}

  async getInteractionSetting(): Promise<string> {
    return this.storage.get(this.secrets.getActiveSecret().id + '_interactionSetting')
  }

  setInteractionSetting(setting: string): Promise<void> {
    return this.storage.set(this.secrets.getActiveSecret().id + '_interactionSetting', setting)
  }

  async getInteractionSettingOfSecret(secret: Secret): Promise<string> {
    return this.storage.get(secret.id + '_interactionSetting')
  }
}
