import { BaseStorage } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import { Storage } from '@ionic/storage'

export enum InteractionType {
  UNDETERMINED = 'UNDETERMINED',
  ALWAYS_ASK = 'ALWAYS_ASK',
  DEEPLINK = 'DEEPLINK',
  QR_CODE = 'QR_CODE'
}

export enum InstallationType {
  UNDETERMINED = 'UNDETERMINED',
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE'
}

// TODO: rename?
export enum AdvancedModeType {
  UNDETERMINED = 'UNDETERMINED',
  SIMPLE = 'SIMPLE',
  ADVANCED = 'ADVANCED'
}

export enum VaultStorageKey {
  DISCLAIMER_GENERATE_INITIAL = 'DISCLAIMER_GENERATE_INITIAL',
  DISCLAIMER_INITIAL = 'DISCLAIMER_INITIAL',
  DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING = 'DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING',
  DISCLAIMER_ELECTRON = 'DISCLAIMER_ELECTRON',
  INTRODUCTION_INITIAL = 'INTRODUCTION_INITIAL',
  ADVANCED_MODE_TYPE = 'ADVANCED_MODE_TYPE',
  INTERACTION_TYPE = 'INTERACTION_TYPE',
  INSTALLATION_TYPE = 'INSTALLATION_TYPE',
  AIRGAP_SECRET_LIST = 'airgap-secret-list'
}

interface VaultStorageKeyReturnType {
  [VaultStorageKey.DISCLAIMER_GENERATE_INITIAL]: boolean
  [VaultStorageKey.DISCLAIMER_INITIAL]: boolean
  [VaultStorageKey.DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING]: boolean
  [VaultStorageKey.DISCLAIMER_ELECTRON]: boolean
  [VaultStorageKey.INTRODUCTION_INITIAL]: boolean
  [VaultStorageKey.ADVANCED_MODE_TYPE]: AdvancedModeType
  [VaultStorageKey.INTERACTION_TYPE]: InteractionType
  [VaultStorageKey.INSTALLATION_TYPE]: InstallationType
  [VaultStorageKey.AIRGAP_SECRET_LIST]: unknown
}

type VaultStorageKeyReturnDefaults = { [key in VaultStorageKey]: VaultStorageKeyReturnType[key] }

const defaultValues: VaultStorageKeyReturnDefaults = {
  [VaultStorageKey.DISCLAIMER_GENERATE_INITIAL]: false,
  [VaultStorageKey.DISCLAIMER_INITIAL]: false,
  [VaultStorageKey.DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING]: false,
  [VaultStorageKey.DISCLAIMER_ELECTRON]: false,
  [VaultStorageKey.INTRODUCTION_INITIAL]: false,
  [VaultStorageKey.ADVANCED_MODE_TYPE]: AdvancedModeType.UNDETERMINED,
  [VaultStorageKey.INTERACTION_TYPE]: InteractionType.UNDETERMINED,
  [VaultStorageKey.INSTALLATION_TYPE]: InstallationType.UNDETERMINED,
  [VaultStorageKey.AIRGAP_SECRET_LIST]: []
}

@Injectable({
  providedIn: 'root'
})
export class VaultStorageService extends BaseStorage<VaultStorageKey, VaultStorageKeyReturnType> {
  constructor(storage: Storage) {
    super(storage, defaultValues)
  }

  wipe() {
    return this.storage.clear()
  }
}
