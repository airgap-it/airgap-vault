import { BaseStorage } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import { Storage } from '@ionic/storage'
import { IACMessageType } from 'airgap-coin-lib'
import { MainProtocolSymbols } from 'airgap-coin-lib/dist/utils/ProtocolSymbols'
import { IACHistoryEntry } from '../iac-history/iac-history.service'

import {
  AeternitySpendingThresholds,
  BitcoinSpendingThresholds,
  CosmosSpendingThresholds,
  EthereumSpendingThresholds,
  SubstrateSpendingThresholds,
  TezosSpendingThresholds,
  Thresholds
} from '../threshold/threshold.service'

const defaultAeternityThresholds: AeternitySpendingThresholds = {
  txsPerDay: null,
  txsPerMonth: null,
  maxAmountPerTx: null,
  amountPerDay: null,
  amountPerMonth: null,
  allowedAddresses: [],
  blockedAddresses: [],
  maxFeesPerTx: null,
  enableContractCalls: true
}

const defaultBitcoinThresholds: BitcoinSpendingThresholds = {
  txsPerDay: null,
  txsPerMonth: null,
  maxAmountPerTx: null,
  amountPerDay: null,
  amountPerMonth: null,
  allowedAddresses: [],
  blockedAddresses: [],
  maxFeesPerTx: null,
  maxInputs: null,
  maxOutputs: null
}

const defaultCosmosThresholds: CosmosSpendingThresholds = {
  txsPerDay: null,
  txsPerMonth: null,
  maxAmountPerTx: null,
  amountPerDay: null,
  amountPerMonth: null,
  allowedAddresses: [],
  blockedAddresses: [],
  maxFeesPerTx: null,
  enableContractCalls: true,
  enabledTransactionTypes: []
}

const defaultEthereumThresholds: EthereumSpendingThresholds = {
  txsPerDay: null,
  txsPerMonth: null,
  maxAmountPerTx: null,
  amountPerDay: null,
  amountPerMonth: null,
  allowedAddresses: [],
  blockedAddresses: [],
  maxGasPricePerTransaction: null,
  maxGasLimitPerTransaction: null,
  enableContractCalls: true
}

const defaultGroestlcoinThresholds: BitcoinSpendingThresholds = {
  txsPerDay: null,
  txsPerMonth: null,
  maxAmountPerTx: null,
  amountPerDay: null,
  amountPerMonth: null,
  allowedAddresses: [],
  blockedAddresses: [],
  maxFeesPerTx: null,
  maxInputs: null,
  maxOutputs: null
}

const defaultKusamaThresholds: SubstrateSpendingThresholds = {
  txsPerDay: null,
  txsPerMonth: null,
  maxAmountPerTx: null,
  amountPerDay: null,
  amountPerMonth: null,
  allowedAddresses: [],
  blockedAddresses: [],
  maxFeesPerTx: null,
  enableContractCalls: true,
  enabledTransactionTypes: []
}

const defaultPolkadotThresholds: SubstrateSpendingThresholds = {
  txsPerDay: null,
  txsPerMonth: null,
  maxAmountPerTx: null,
  amountPerDay: null,
  amountPerMonth: null,
  allowedAddresses: [],
  blockedAddresses: [],
  maxFeesPerTx: null,
  enableContractCalls: true,
  enabledTransactionTypes: []
}

const defaultTezosThresholds: TezosSpendingThresholds = {
  txsPerDay: null,
  txsPerMonth: null,
  maxAmountPerTx: null,
  amountPerDay: null,
  amountPerMonth: null,
  allowedAddresses: [],
  blockedAddresses: [],
  maxFeesPerTx: null,
  enableContractCalls: true,
  enabledTransactionTypes: []
}

const defaultObject: Thresholds = {
  global: {
    app: {
      showMnemonicAgain: false,
      bip39Passphrase: true,
      twoFactorAuthCodes: false
    },
    message: {
      [IACMessageType.AccountShareRequest]: true,
      [IACMessageType.AccountShareResponse]: true,
      [IACMessageType.MessageSignRequest]: true,
      [IACMessageType.MessageSignResponse]: true,
      [IACMessageType.MetadataRequest]: true,
      [IACMessageType.MetadataResponse]: true,
      [IACMessageType.TransactionSignRequest]: true,
      [IACMessageType.TransactionSignResponse]: true
    }
  },
  protocol: {
    [MainProtocolSymbols.AE]: defaultAeternityThresholds,
    [MainProtocolSymbols.BTC]: defaultBitcoinThresholds,
    [MainProtocolSymbols.COSMOS]: defaultCosmosThresholds,
    [MainProtocolSymbols.ETH]: defaultEthereumThresholds,
    [MainProtocolSymbols.GRS]: defaultGroestlcoinThresholds,
    [MainProtocolSymbols.KUSAMA]: defaultKusamaThresholds,
    [MainProtocolSymbols.POLKADOT]: defaultPolkadotThresholds,
    [MainProtocolSymbols.XTZ]: defaultTezosThresholds
  },
  accounts: {
    [MainProtocolSymbols.AE]: {
      d956ac630bcc7faaf69fb3bfc0aaa43ff9958210df68c9a048056b7b3c85f6c9: {
        message: {
          [IACMessageType.AccountShareRequest]: true,
          [IACMessageType.AccountShareResponse]: true,
          [IACMessageType.MessageSignRequest]: true,
          [IACMessageType.MessageSignResponse]: true,
          [IACMessageType.MetadataRequest]: true,
          [IACMessageType.MetadataResponse]: true,
          [IACMessageType.TransactionSignRequest]: true,
          [IACMessageType.TransactionSignResponse]: true
        },
        spending: defaultAeternityThresholds
      }
    },
    [MainProtocolSymbols.BTC]: {},
    [MainProtocolSymbols.COSMOS]: {},
    [MainProtocolSymbols.ETH]: {},
    [MainProtocolSymbols.GRS]: {},
    [MainProtocolSymbols.KUSAMA]: {},
    [MainProtocolSymbols.POLKADOT]: {},
    [MainProtocolSymbols.XTZ]: {}
  }
}

export enum VaultStorageKey {
  DISCLAIMER_GENERATE_INITIAL = 'DISCLAIMER_GENERATE_INITIAL',
  DISCLAIMER_INITIAL = 'DISCLAIMER_INITIAL',
  DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING = 'DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING',
  DISCLAIMER_ELECTRON = 'DISCLAIMER_ELECTRON',
  INTRODUCTION_INITIAL = 'INTRODUCTION_INITIAL',
  AIRGAP_SECRET_LIST = 'airgap-secret-list',
  THRESHOLDS = 'THRESHOLDS',
  INTERNAL_KEYPAIR_SEED = 'INTERNAL_KEYPAIR_SEED',
  IAC_HISTORY = 'IAC_HISTORY'
}

interface VaultStorageKeyReturnType {
  [VaultStorageKey.DISCLAIMER_GENERATE_INITIAL]: boolean
  [VaultStorageKey.DISCLAIMER_INITIAL]: boolean
  [VaultStorageKey.DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING]: boolean
  [VaultStorageKey.DISCLAIMER_ELECTRON]: boolean
  [VaultStorageKey.INTRODUCTION_INITIAL]: boolean
  [VaultStorageKey.AIRGAP_SECRET_LIST]: unknown
  [VaultStorageKey.THRESHOLDS]: Thresholds
  [VaultStorageKey.INTERNAL_KEYPAIR_SEED]: string | undefined
  [VaultStorageKey.IAC_HISTORY]: IACHistoryEntry[]
}

type VaultStorageKeyReturnDefaults = { [key in VaultStorageKey]: VaultStorageKeyReturnType[key] }

const defaultValues: VaultStorageKeyReturnDefaults = {
  [VaultStorageKey.DISCLAIMER_GENERATE_INITIAL]: false,
  [VaultStorageKey.DISCLAIMER_INITIAL]: false,
  [VaultStorageKey.DISCLAIMER_HIDE_LOCAL_AUTH_ONBOARDING]: false,
  [VaultStorageKey.DISCLAIMER_ELECTRON]: false,
  [VaultStorageKey.INTRODUCTION_INITIAL]: false,
  [VaultStorageKey.AIRGAP_SECRET_LIST]: [],
  [VaultStorageKey.THRESHOLDS]: defaultObject,
  [VaultStorageKey.INTERNAL_KEYPAIR_SEED]: undefined,
  [VaultStorageKey.IAC_HISTORY]: []
}

@Injectable({
  providedIn: 'root'
})
export class VaultStorageService extends BaseStorage<VaultStorageKey, VaultStorageKeyReturnType> {
  constructor(storage: Storage) {
    super(storage, defaultValues)
  }
}
