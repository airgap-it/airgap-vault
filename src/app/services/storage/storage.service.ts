import { BaseStorage } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import { Storage } from '@ionic/storage'
import { Observable, ReplaySubject } from 'rxjs'
import CordovaSQLiteDriver from 'localforage-cordovasqlitedriver'

export enum LanguagesType {
  EN = 'en',
  DE = 'de',
  // ES = 'es',
  PT_BR = 'pt_BR',
  ZH_CN = 'zh_CN'
}

export enum InteractionType {
  UNDETERMINED = 'UNDETERMINED',
  ALWAYS_ASK = 'ALWAYS_ASK',
  DEEPLINK = 'DEEPLINK',
  QR_CODE = 'QR_CODE'
}

export enum InstallationType {
  UNDETERMINED = 'UNDETERMINED',
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  ALWAYS_ASK = 'ALWAYS_ASK'
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
  LANGUAGE_TYPE = 'LANGUAGE_TYPE',
  INSTALLATION_TYPE = 'INSTALLATION_TYPE',
  AIRGAP_SECRET_LIST = 'airgap-secret-list',
  AIRGAP_CONTACTS_LIST = 'airgap-contacts-list',
  AIRGAP_CONTACTS_RECOMMENDED_LIST = 'airgap-contacts-recommended-list',
  ADDRESS_BOOK_DISABLED = 'ADDRESS_BOOK_DISABLED',
  ADDRESS_BOOK_SUGGESTIONS_DISABLED = 'ADDRESS_BOOK_SUGGESTIONS_DISABLED',
  ADDRESS_BOOK_ONBOARDING_DISABLED = 'ADDRESS_BOOK_ONBOARDING_DISABLED',
  ISOLATED_MODULES_ONBOARDING_DISABLED = 'ISOLATED_MODULES_ONBOARDING_DISABLED',
  SHOP_BANNER_DISABLED = 'SHOP_BANNER_DISABLED'
}

interface VaultStorageKeyReturnType {
  [VaultStorageKey.DISCLAIMER_GENERATE_INITIAL]: boolean
  [VaultStorageKey.DISCLAIMER_INITIAL]: boolean
  [VaultStorageKey.DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING]: boolean
  [VaultStorageKey.DISCLAIMER_ELECTRON]: boolean
  [VaultStorageKey.INTRODUCTION_INITIAL]: boolean
  [VaultStorageKey.ADVANCED_MODE_TYPE]: AdvancedModeType
  [VaultStorageKey.INTERACTION_TYPE]: InteractionType
  [VaultStorageKey.LANGUAGE_TYPE]: LanguagesType | undefined
  [VaultStorageKey.INSTALLATION_TYPE]: InstallationType
  [VaultStorageKey.AIRGAP_SECRET_LIST]: unknown
  [VaultStorageKey.AIRGAP_CONTACTS_LIST]: unknown
  [VaultStorageKey.AIRGAP_CONTACTS_RECOMMENDED_LIST]: string[]
  [VaultStorageKey.ADDRESS_BOOK_DISABLED]: boolean
  [VaultStorageKey.ADDRESS_BOOK_SUGGESTIONS_DISABLED]: boolean
  [VaultStorageKey.ADDRESS_BOOK_ONBOARDING_DISABLED]: boolean
  [VaultStorageKey.ISOLATED_MODULES_ONBOARDING_DISABLED]: boolean
  [VaultStorageKey.SHOP_BANNER_DISABLED]: boolean
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
  [VaultStorageKey.LANGUAGE_TYPE]: undefined,
  [VaultStorageKey.INSTALLATION_TYPE]: InstallationType.UNDETERMINED,
  [VaultStorageKey.AIRGAP_SECRET_LIST]: [],
  [VaultStorageKey.AIRGAP_CONTACTS_LIST]: [],
  [VaultStorageKey.AIRGAP_CONTACTS_RECOMMENDED_LIST]: [],
  [VaultStorageKey.ADDRESS_BOOK_DISABLED]: false,
  [VaultStorageKey.ADDRESS_BOOK_SUGGESTIONS_DISABLED]: false,
  [VaultStorageKey.ADDRESS_BOOK_ONBOARDING_DISABLED]: false,
  [VaultStorageKey.ISOLATED_MODULES_ONBOARDING_DISABLED]: false,
  [VaultStorageKey.SHOP_BANNER_DISABLED]: false
}

@Injectable({
  providedIn: 'root'
})
export class VaultStorageService extends BaseStorage<VaultStorageKey, VaultStorageKeyReturnType> {
  private observables: Record<string, ReplaySubject<any>> = {}

  constructor(storage: Storage) {
    super(storage, defaultValues, [CordovaSQLiteDriver])
  }

  public async set<K extends VaultStorageKey>(key: K, value: VaultStorageKeyReturnType[K]): Promise<void> {
    if (this.observables[key]) {
      this.observables[key].next(value)
    }
    return super.set(key, value)
  }

  public async wipe() {
    const storage = await this.getStorage()
    return storage.clear()
  }

  public subscribe<K extends VaultStorageKey>(key: K): Observable<VaultStorageKeyReturnType[K]> {
    if (!this.observables[key]) {
      this.observables[key] = new ReplaySubject(1)

      this.getStorage()
        .then((storage) => storage.get(key))
        .then((value) => {
          this.observables[key].next(value ?? defaultValues[key])
        })
    }

    return this.observables[key].asObservable()
  }
}
