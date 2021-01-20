import { BaseStorage } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import { Storage } from '@ionic/storage'

export enum VaultStorageKey {
  DISCLAIMER_GENERATE_INITIAL = 'DISCLAIMER_GENERATE_INITIAL',
  DISCLAIMER_INITIAL = 'DISCLAIMER_INITIAL',
  DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING = 'DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING',
  DISCLAIMER_ELECTRON = 'DISCLAIMER_ELECTRON',
  INTRODUCTION_INITIAL = 'INTRODUCTION_INITIAL',
  ADVANCED_MODE = 'ADVANCED_MODE',
  AIRGAP_SECRET_LIST = 'airgap-secret-list'
}

interface VaultStorageKeyReturnType {
  [VaultStorageKey.DISCLAIMER_GENERATE_INITIAL]: boolean
  [VaultStorageKey.DISCLAIMER_INITIAL]: boolean
  [VaultStorageKey.DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING]: boolean
  [VaultStorageKey.DISCLAIMER_ELECTRON]: boolean
  [VaultStorageKey.INTRODUCTION_INITIAL]: boolean
  [VaultStorageKey.ADVANCED_MODE]: boolean
  [VaultStorageKey.AIRGAP_SECRET_LIST]: unknown
}

type VaultStorageKeyReturnDefaults = { [key in VaultStorageKey]: VaultStorageKeyReturnType[key] }

const defaultValues: VaultStorageKeyReturnDefaults = {
  [VaultStorageKey.DISCLAIMER_GENERATE_INITIAL]: false,
  [VaultStorageKey.DISCLAIMER_INITIAL]: false,
  [VaultStorageKey.DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING]: false,
  [VaultStorageKey.DISCLAIMER_ELECTRON]: false,
  [VaultStorageKey.INTRODUCTION_INITIAL]: false,
  [VaultStorageKey.ADVANCED_MODE]: true,
  [VaultStorageKey.AIRGAP_SECRET_LIST]: []
}

@Injectable({
  providedIn: 'root'
})
export class VaultStorageService extends BaseStorage<VaultStorageKey, VaultStorageKeyReturnType> {
  constructor(storage: Storage) {
    super(storage, defaultValues)
  }
}
