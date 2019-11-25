import { Injectable } from '@angular/core'
import { Storage } from '@ionic/storage'

export enum SettingsKey {
  DISCLAIMER_GENERATE_INITIAL = 'DISCLAIMER_GENERATE_INITIAL',
  DISCLAIMER_INITIAL = 'DISCLAIMER_INITIAL',
  DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING = 'DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING',
  DISCLAIMER_ELECTRON = 'DISCLAIMER_ELECTRON',
  INTRODUCTION_INITIAL = 'INTRODUCTION_INITIAL',
  AIRGAP_SECRET_LIST = 'airgap-secret-list',
  SETTINGS_SERIALIZER_ENABLE_V2 = 'SETTINGS_SERIALIZER_ENABLE_V2',
  SETTINGS_SERIALIZER_CHUNK_TIME = 'SETTINGS_SERIALIZER_CHUNK_TIME',
  SETTINGS_SERIALIZER_CHUNK_SIZE = 'SETTINGS_SERIALIZER_CHUNK_SIZE'
}

type SettingsKeyReturnType = {
  [SettingsKey.DISCLAIMER_GENERATE_INITIAL]: boolean
  [SettingsKey.DISCLAIMER_INITIAL]: boolean
  [SettingsKey.DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING]: boolean
  [SettingsKey.DISCLAIMER_ELECTRON]: boolean
  [SettingsKey.INTRODUCTION_INITIAL]: boolean
  [SettingsKey.AIRGAP_SECRET_LIST]: unknown
  [SettingsKey.SETTINGS_SERIALIZER_ENABLE_V2]: boolean
  [SettingsKey.SETTINGS_SERIALIZER_CHUNK_TIME]: number
  [SettingsKey.SETTINGS_SERIALIZER_CHUNK_SIZE]: number
}

type SettingsKeyReturnDefaults = { [key in SettingsKey]: SettingsKeyReturnType[key] }

const defaultValues: SettingsKeyReturnDefaults = {
  [SettingsKey.DISCLAIMER_GENERATE_INITIAL]: false,
  [SettingsKey.DISCLAIMER_INITIAL]: false,
  [SettingsKey.DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING]: false,
  [SettingsKey.DISCLAIMER_ELECTRON]: false,
  [SettingsKey.INTRODUCTION_INITIAL]: false,
  [SettingsKey.AIRGAP_SECRET_LIST]: [],
  [SettingsKey.SETTINGS_SERIALIZER_ENABLE_V2]: false,
  [SettingsKey.SETTINGS_SERIALIZER_CHUNK_TIME]: 250,
  [SettingsKey.SETTINGS_SERIALIZER_CHUNK_SIZE]: 100
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private readonly storage: Storage) {}

  public async get<K extends SettingsKey>(key: K): Promise<SettingsKeyReturnType[K]> {
    const value: SettingsKeyReturnType[K] = (await this.storage.get(key)) || defaultValues[key]
    console.log(`[SETTINGS_SERVICE:get] ${key}, returned: ${value}`)
    return value
  }

  public async set<K extends SettingsKey>(key: K, value: SettingsKeyReturnType[K]): Promise<any> {
    console.log(`[SETTINGS_SERVICE:set] ${key}, ${value}`)
    return this.storage.set(key, value)
  }

  public async delete<K extends SettingsKey>(key: K): Promise<boolean> {
    try {
      await this.storage.remove(key)
      return true
    } catch (error) {
      return false
    }
  }
}
