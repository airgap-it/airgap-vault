import { assertNever } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import { IACMessageDefinitionObject, IACMessageType } from 'airgap-coin-lib'
import { CosmosMessageTypeIndex } from 'airgap-coin-lib/dist/protocols/cosmos/cosmos-message/CosmosMessage'
import { SubstrateTransactionType } from 'airgap-coin-lib/dist/protocols/substrate/helpers/data/transaction/SubstrateTransaction'
import { TezosOperationType } from 'airgap-coin-lib/dist/protocols/tezos/types/TezosOperationType'
import { MainProtocolSymbols } from 'airgap-coin-lib/dist/utils/ProtocolSymbols'

import { PeerService } from '../peer/peer.service'
import { VaultStorageKey, VaultStorageService } from '../storage/storage.service'

export interface AppThresholds {
  showMnemonicAgain: boolean
  bip39Passphrase: boolean
  twoFactorAuthCodes: boolean
}
export type MessageThresholds = { [key in IACMessageType]: boolean }
export interface SpendingThresholds {
  txsPerDay: number
  txsPerMonth: number
  maxAmountPerTx: number
  amountPerDay: number
  amountPerMonth: number
  allowedAddresses: string[]
  blockedAddresses: string[]
}

export interface AeternitySpendingThresholds extends SpendingThresholds {
  maxFeesPerTx: number
  enableContractCalls: boolean
}

export interface BitcoinSpendingThresholds extends SpendingThresholds {
  maxFeesPerTx: number
  maxInputs: number
  maxOutputs: number
}

export interface EthereumSpendingThresholds extends SpendingThresholds {
  maxGasPricePerTransaction: number
  maxGasLimitPerTransaction: number
  enableContractCalls: boolean
}

export interface TezosSpendingThresholds extends SpendingThresholds {
  maxFeesPerTx: number
  enableContractCalls: boolean
  enabledTransactionTypes: TezosOperationType[]
}

export interface CosmosSpendingThresholds extends SpendingThresholds {
  maxFeesPerTx: number
  enableContractCalls: boolean
  enabledTransactionTypes: CosmosMessageTypeIndex[]
}

export interface SubstrateSpendingThresholds extends SpendingThresholds {
  maxFeesPerTx: number
  enableContractCalls: boolean
  enabledTransactionTypes: SubstrateTransactionType[]
}

interface ProtocolType {
  [MainProtocolSymbols.AE]: AeternitySpendingThresholds
  [MainProtocolSymbols.BTC]: BitcoinSpendingThresholds
  [MainProtocolSymbols.COSMOS]: CosmosSpendingThresholds
  [MainProtocolSymbols.ETH]: EthereumSpendingThresholds
  [MainProtocolSymbols.GRS]: BitcoinSpendingThresholds
  [MainProtocolSymbols.KUSAMA]: SubstrateSpendingThresholds
  [MainProtocolSymbols.POLKADOT]: SubstrateSpendingThresholds
  [MainProtocolSymbols.XTZ]: TezosSpendingThresholds
}

export type ProtocolThresholds = { [key in MainProtocolSymbols]: ProtocolType[key] }

export type AccountThreshold<T extends SpendingThresholds> = Record<
  string, // publicKey
  {
    message: MessageThresholds
    spending: T
  }
>

interface AccountType {
  [MainProtocolSymbols.AE]: AccountThreshold<AeternitySpendingThresholds>
  [MainProtocolSymbols.BTC]: AccountThreshold<BitcoinSpendingThresholds>
  [MainProtocolSymbols.COSMOS]: AccountThreshold<CosmosSpendingThresholds>
  [MainProtocolSymbols.ETH]: AccountThreshold<EthereumSpendingThresholds>
  [MainProtocolSymbols.GRS]: AccountThreshold<BitcoinSpendingThresholds>
  [MainProtocolSymbols.KUSAMA]: AccountThreshold<SubstrateSpendingThresholds>
  [MainProtocolSymbols.POLKADOT]: AccountThreshold<SubstrateSpendingThresholds>
  [MainProtocolSymbols.XTZ]: AccountThreshold<TezosSpendingThresholds>
}

export type AccountMap = { [key in MainProtocolSymbols]: AccountType[key] }

export interface Thresholds {
  global: {
    app: AppThresholds
    message: MessageThresholds
  }
  protocol: ProtocolThresholds
  accounts: AccountMap
}

export interface ThresholdReturn {
  allowed: boolean
  message: string
}

@Injectable({
  providedIn: 'root'
})
export class ThresholdService {
  constructor(private readonly peerService: PeerService, private readonly storageService: VaultStorageService) {}

  public async setThreshold(key: string, value: any, publicKey: string, signature: string): Promise<void> {
    const isValid: boolean = await this.peerService.verify([key, value].join(':'), signature, publicKey)

    if (!isValid) {
      throw new Error('Invalid signature')
    }

    const thresholds: Thresholds = await this.getThresholds()
    const newThresholds: Thresholds = await this.applyKeyToObject(thresholds, key, value)

    return this.storageService.set(VaultStorageKey.THRESHOLDS, newThresholds)
  }

  public async getThreshold(key: string): Promise<any> {
    const thresholds: Thresholds = await this.getThresholds()

    return thresholds[key] // TODO: Implement
  }

  public async getThresholds(): Promise<Thresholds> {
    return this.storageService.get(VaultStorageKey.THRESHOLDS)
  }

  public async checkThreshold(message: IACMessageDefinitionObject): Promise<ThresholdReturn> {
    const thresholds: Thresholds = await this.getThresholds()

    switch (message.type) {
      case IACMessageType.AccountShareRequest:
      case IACMessageType.AccountShareResponse:
      case IACMessageType.MessageSignRequest:
      case IACMessageType.MessageSignResponse:
      case IACMessageType.MetadataRequest:
      case IACMessageType.MetadataResponse:
      case IACMessageType.TransactionSignResponse:
        thresholds.global
        return { allowed: true, message: '' }
      case IACMessageType.TransactionSignRequest:
        return { allowed: false, message: '' }

      default:
        assertNever('IACMessageDefinitionObject', message.type)
        // throw new Error('Amount too high')

        return { allowed: false, message: '' }
    }
  }

  public async applyKeyToObject(object: Thresholds, key: string, value: any): Promise<Thresholds> {
    const newObject: Thresholds = JSON.parse(
      JSON.stringify(object, (_k, v) => (v === undefined ? '__undefined' : v))
        .split('__undefined')
        .join('undefined')
    )

    // Key is in the form of "global.message.5"
    const splits = key.split('.')
    let tempObj = newObject
    splits.forEach((split: string, index: number): void => {
      if (index === splits.length - 1) {
        const objectType = typeof tempObj[split]
        const valueType = typeof value
        // We reached the last element, need to assign a value
        console.log('types', objectType, valueType)
        if (objectType !== valueType && !(tempObj[split] === null || value === null)) {
          throw new Error(`"${key}":"${value}" - New value is not of the same type as the old value`)
        } else if (Array.isArray(tempObj[split])) {
          throw new Error(`"${key}":"${value}" - Setting an array is currently not supported`)
        } else if (objectType === 'object' && tempObj[split] !== null) {
          throw new Error(`"${key}":"${value}" - Cannot overwrite object. Please use a more specific key`)
        } else {
          tempObj[split] = value
        }
      } else {
        if (tempObj && tempObj[split] !== undefined) {
          tempObj = tempObj[split]
        } else {
          console.log(tempObj, split, tempObj[split])
          throw new Error(`"${key}":"${value}" - Object is undefined`)
        }
      }
    })

    return newObject
  }
}
