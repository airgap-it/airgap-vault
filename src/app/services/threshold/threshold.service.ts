import { assertNever, ProtocolService } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import {
  IACMessageDefinitionObject,
  IACMessageType,
  IAirGapTransaction,
  ICoinProtocol,
  UnsignedBitcoinTransaction,
  UnsignedEthereumTransaction,
  UnsignedTransaction
} from 'airgap-coin-lib'
import { CosmosMessageTypeIndex } from 'airgap-coin-lib/dist/protocols/cosmos/cosmos-message/CosmosMessage'
import { SubstrateTransactionType } from 'airgap-coin-lib/dist/protocols/substrate/helpers/data/transaction/SubstrateTransaction'
import { TezosOperationType } from 'airgap-coin-lib/dist/protocols/tezos/types/TezosOperationType'
import { MainProtocolSymbols } from 'airgap-coin-lib/dist/utils/ProtocolSymbols'
import BigNumber from 'bignumber.js'

import { IACHistoryEntry, IACHistoryService } from '../iac-history/iac-history.service'
import { PeerService } from '../peer/peer.service'
import { VaultStorageKey, VaultStorageService } from '../storage/storage.service'

const DAY = 1000 * 60 * 60 * 24
const MONTH = DAY * 31

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

const log = (...args) => {
  console.log(...args)
}

@Injectable({
  providedIn: 'root'
})
export class ThresholdService {
  constructor(
    private readonly peerService: PeerService,
    private readonly storageService: VaultStorageService,
    private readonly iacHistoryService: IACHistoryService,
    private readonly protocolService: ProtocolService
  ) {}

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

  public async checkThreshold(messages: IACMessageDefinitionObject[]): Promise<ThresholdReturn> {
    const thresholds: Thresholds = await this.getThresholds()
    const message = messages[0]

    // TODO: Handle multiple messages

    console.log('checking limit for', message)
    const messageAllowed = await this.checkMessageAllowed(message, thresholds)

    if (!messageAllowed) {
      return { allowed: false, message: 'You are not allowed to handle this type of message!' }
    }

    const protocolThreshold = await this.checkProtocolThresholdAllowed(message, thresholds)

    if (!protocolThreshold) {
      return { allowed: false, message: 'You are not allowed to handle this type of message!' }
    }

    return { allowed: true, message: '' }
  }

  public async checkMessageAllowed(message: IACMessageDefinitionObject, threshold: Thresholds): Promise<boolean> {
    if (!threshold.global.message[message.type]) {
      return false
    }
    if (message.type !== IACMessageType.TransactionSignRequest) {
      return true
    }
    const accountThreshold = threshold.accounts.ae[(message.payload as UnsignedTransaction).publicKey]
    if (accountThreshold) {
      if (!accountThreshold.message[message.type]) {
        return false
      }
    }

    return true
  }

  public async checkProtocolThresholdAllowed(message: IACMessageDefinitionObject, threshold: Thresholds): Promise<boolean> {
    if (message.type !== IACMessageType.TransactionSignRequest) {
      return true
    }

    const history: IACHistoryEntry[] = await this.iacHistoryService.getAll()

    if (!(await this.checkAllProtocolThresholds(message, history, threshold.protocol[message.protocol]))) {
      return false
    }

    const accountSpendingThreshold: SpendingThresholds =
      threshold?.accounts[message.protocol][(message.payload as UnsignedTransaction).publicKey]?.spending

    if (accountSpendingThreshold && !(await this.checkAllProtocolThresholds(message, history, accountSpendingThreshold))) {
      return false
    }

    return true
  }

  // tslint:disable-next-line: cyclomatic-complexity
  public async checkAllProtocolThresholds(
    message: IACMessageDefinitionObject,
    history: IACHistoryEntry[],
    spendingThreshold: SpendingThresholds
  ): Promise<boolean> {
    const payload: UnsignedTransaction = message.payload as UnsignedTransaction

    const protocol: ICoinProtocol = await this.protocolService.getProtocol(message.protocol, undefined, false)
    const txDetails: IAirGapTransaction[] = await protocol.getTransactionDetails(payload)

    // Check general limits first
    if (spendingThreshold.txsPerDay !== null && !(await this.allowTxsPerDay(payload, txDetails, history, spendingThreshold.txsPerDay))) {
      return false
    }
    if (
      spendingThreshold.txsPerMonth !== null &&
      !(await this.allowTxsPerMonth(payload, txDetails, history, spendingThreshold.txsPerMonth))
    ) {
      return false
    }
    if (
      spendingThreshold.maxAmountPerTx !== null &&
      !(await this.allowMaxAmountPerTx(payload, txDetails, history, spendingThreshold.maxAmountPerTx))
    ) {
      return false
    }
    if (
      spendingThreshold.amountPerDay !== null &&
      !(await this.allowAmountPerDay(payload, txDetails, history, spendingThreshold.amountPerDay))
    ) {
      return false
    }
    if (
      spendingThreshold.amountPerMonth !== null &&
      !(await this.allowAmountPerMonth(payload, txDetails, history, spendingThreshold.amountPerMonth))
    ) {
      return false
    }
    if (
      spendingThreshold.allowedAddresses !== null &&
      !(await this.allowAllowedAddresses(payload, txDetails, history, spendingThreshold.allowedAddresses))
    ) {
      return false
    }
    if (
      spendingThreshold.blockedAddresses !== null &&
      !(await this.allowBlockedAddresses(payload, txDetails, history, spendingThreshold.blockedAddresses))
    ) {
      return false
    }

    // Now check account specific limits
    const protocolIdentifier: MainProtocolSymbols = message.protocol.split('-')[0] as MainProtocolSymbols
    switch (protocolIdentifier) {
      case MainProtocolSymbols.AE:
        if (
          (spendingThreshold as AeternitySpendingThresholds).maxFeesPerTx !== null &&
          !(await this.allowMaxFeesPerTx(payload, txDetails, history, (spendingThreshold as AeternitySpendingThresholds).maxFeesPerTx))
        ) {
          return false
        }
        if (
          (spendingThreshold as AeternitySpendingThresholds).enableContractCalls !== null &&
          !(await this.allowEnableContractCalls(
            payload,
            txDetails,
            history,
            (spendingThreshold as AeternitySpendingThresholds).enableContractCalls
          ))
        ) {
          return false
        }
        break

      case MainProtocolSymbols.BTC:
      case MainProtocolSymbols.GRS:
        if (
          (spendingThreshold as BitcoinSpendingThresholds).maxFeesPerTx !== null &&
          !(await this.allowMaxFeesPerTx(payload, txDetails, history, (spendingThreshold as BitcoinSpendingThresholds).maxFeesPerTx))
        ) {
          return false
        }
        if (
          (spendingThreshold as BitcoinSpendingThresholds).maxInputs !== null &&
          !(await this.allowMaxInputs(payload, txDetails, history, (spendingThreshold as BitcoinSpendingThresholds).maxInputs))
        ) {
          return false
        }
        if (
          (spendingThreshold as BitcoinSpendingThresholds).maxOutputs !== null &&
          !(await this.allowMaxOutputs(payload, txDetails, history, (spendingThreshold as BitcoinSpendingThresholds).maxOutputs))
        ) {
          return false
        }

        break

      case MainProtocolSymbols.COSMOS:
        if (
          (spendingThreshold as CosmosSpendingThresholds).maxFeesPerTx !== null &&
          !(await this.allowMaxFeesPerTx(payload, txDetails, history, (spendingThreshold as CosmosSpendingThresholds).maxFeesPerTx))
        ) {
          return false
        }
        if (
          (spendingThreshold as CosmosSpendingThresholds).enableContractCalls !== null &&
          !(await this.allowEnableContractCalls(
            payload,
            txDetails,
            history,
            (spendingThreshold as CosmosSpendingThresholds).enableContractCalls
          ))
        ) {
          return false
        }
        if (
          (spendingThreshold as CosmosSpendingThresholds).enabledTransactionTypes !== null &&
          !(await this.allowEnabledTransactionTypes(
            payload,
            txDetails,
            history,
            (spendingThreshold as CosmosSpendingThresholds).enabledTransactionTypes
          ))
        ) {
          return false
        }

        break

      case MainProtocolSymbols.ETH:
        if (
          (spendingThreshold as EthereumSpendingThresholds).enableContractCalls !== null &&
          !(await this.allowEnableContractCalls(
            payload,
            txDetails,
            history,
            (spendingThreshold as EthereumSpendingThresholds).enableContractCalls
          ))
        ) {
          return false
        }
        if (
          (spendingThreshold as EthereumSpendingThresholds).maxGasPricePerTransaction !== null &&
          !(await this.allowMaxGasPricePerTransaction(
            payload,
            txDetails,
            history,
            (spendingThreshold as EthereumSpendingThresholds).maxGasPricePerTransaction
          ))
        ) {
          return false
        }
        if (
          (spendingThreshold as EthereumSpendingThresholds).maxGasLimitPerTransaction !== null &&
          !(await this.allowMaxGasLimitPerTransaction(
            payload,
            txDetails,
            history,
            (spendingThreshold as EthereumSpendingThresholds).maxGasLimitPerTransaction
          ))
        ) {
          return false
        }

        break

      case MainProtocolSymbols.KUSAMA:
      case MainProtocolSymbols.POLKADOT:
        if (
          (spendingThreshold as SubstrateSpendingThresholds).maxFeesPerTx &&
          !(await this.allowMaxFeesPerTx(payload, txDetails, history, (spendingThreshold as SubstrateSpendingThresholds).maxFeesPerTx))
        ) {
          return false
        }
        if (
          (spendingThreshold as SubstrateSpendingThresholds).enableContractCalls !== null &&
          !(await this.allowEnableContractCalls(
            payload,
            txDetails,
            history,
            (spendingThreshold as SubstrateSpendingThresholds).enableContractCalls
          ))
        ) {
          return false
        }
        if (
          (spendingThreshold as SubstrateSpendingThresholds).enabledTransactionTypes !== null &&
          !(await this.allowEnabledTransactionTypes(
            payload,
            txDetails,
            history,
            (spendingThreshold as SubstrateSpendingThresholds).enabledTransactionTypes
          ))
        ) {
          return false
        }

        break

      case MainProtocolSymbols.XTZ:
        if (
          (spendingThreshold as TezosSpendingThresholds).maxFeesPerTx !== null &&
          !(await this.allowMaxFeesPerTx(payload, txDetails, history, (spendingThreshold as TezosSpendingThresholds).maxFeesPerTx))
        ) {
          return false
        }
        if (
          (spendingThreshold as TezosSpendingThresholds).enableContractCalls !== null &&
          !(await this.allowEnableContractCalls(
            payload,
            txDetails,
            history,
            (spendingThreshold as TezosSpendingThresholds).enableContractCalls
          ))
        ) {
          return false
        }
        if (
          (spendingThreshold as TezosSpendingThresholds).enabledTransactionTypes !== null &&
          !(await this.allowEnabledTransactionTypes(
            payload,
            txDetails,
            history,
            (spendingThreshold as TezosSpendingThresholds).enabledTransactionTypes
          ))
        ) {
          return false
        }

        break

      default:
        assertNever('protocol', protocolIdentifier)
    }

    return true
  }

  private async allowMaxGasLimitPerTransaction(
    payload: UnsignedEthereumTransaction,
    _txDetails: IAirGapTransaction[],
    _history: IACHistoryEntry[],
    maxGasLimitPerTransaction: number
  ): Promise<boolean> {
    console.log('ETH GAS PRICE TEST', payload.transaction.gasLimit)
    const allow: boolean = parseInt(payload.transaction.gasLimit, 16) < maxGasLimitPerTransaction
    log(`allowMaxGasLimitPerTransaction - outcome: ${allow}`)

    return allow
  }

  private async allowMaxGasPricePerTransaction(
    payload: UnsignedEthereumTransaction,
    _txDetails: IAirGapTransaction[],
    _history: IACHistoryEntry[],
    maxGasPricePerTransaction: number
  ): Promise<boolean> {
    const allow: boolean = parseInt(payload.transaction.gasPrice, 16) < maxGasPricePerTransaction
    log(`allowMaxGasPricePerTransaction - outcome: ${allow}`)

    return allow
  }

  private async allowEnabledTransactionTypes(
    _payload: UnsignedTransaction,
    _txDetails: IAirGapTransaction[],
    _history: IACHistoryEntry[],
    _enabledTransactionTypes: any // CosmosMessageTypeIndex[]
  ): Promise<boolean> {
    log(`allowEnabledTransactionTypes - outcome: ${'always true'}`)

    return true
  }

  private async allowMaxOutputs(
    payload: UnsignedBitcoinTransaction,
    _txDetails: IAirGapTransaction[],
    _history: IACHistoryEntry[],
    maxOutputs: number
  ): Promise<boolean> {
    const allow: boolean = payload.transaction.outs.length > maxOutputs
    log(`allowMaxOutputs - outcome: ${allow}`)

    return allow
  }

  private async allowMaxInputs(
    payload: UnsignedBitcoinTransaction,
    _txDetails: IAirGapTransaction[],
    _history: IACHistoryEntry[],
    maxInputs: number
  ): Promise<boolean> {
    const allow: boolean = payload.transaction.ins.length > maxInputs
    log(`allowMaxOutputs - outcome: ${allow}`)

    return allow
  }

  private async allowEnableContractCalls(
    _payload: UnsignedTransaction,
    txDetails: IAirGapTransaction[],
    _history: IACHistoryEntry[],
    enableContractCalls: boolean
  ): Promise<boolean> {
    const allow: boolean = txDetails.every(
      (txDetail: IAirGapTransaction) => enableContractCalls || (Boolean(txDetail.data) && !enableContractCalls)
    )
    log(`allowEnableContractCalls - outcome: ${allow}`)

    return allow
  }

  private async allowMaxFeesPerTx(
    _payload: UnsignedTransaction,
    txDetails: IAirGapTransaction[],
    _history: IACHistoryEntry[],
    maxFeesPerTx: number
  ): Promise<boolean> {
    const allow: boolean = txDetails.every((txDetail: IAirGapTransaction) => new BigNumber(txDetail.fee).isLessThan(maxFeesPerTx))
    log(`allowMaxFeesPerTx - outcome: ${allow}`)

    return allow
  }

  private async allowBlockedAddresses(
    _payload: UnsignedTransaction,
    txDetails: IAirGapTransaction[],
    _history: IACHistoryEntry[],
    blockedAddresses: string[]
  ): Promise<boolean> {
    // TODO: How do we handle upper/lowercase?
    const allow: boolean = txDetails.every((txDetail: IAirGapTransaction) =>
      blockedAddresses.every((blockedAddress: string) => !txDetail.to.includes(blockedAddress))
    )
    log(`allowBlockedAddresses - outcome: ${allow}`)

    return allow
  }

  private async allowAllowedAddresses(
    _payload: UnsignedTransaction,
    txDetails: IAirGapTransaction[],
    _history: IACHistoryEntry[],
    allowedAddresses: string[]
  ): Promise<boolean> {
    // TODO: How do we handle upper/lowercase?
    const allow: boolean = txDetails.every((txDetail: IAirGapTransaction) =>
      txDetail.to.every((to: string) => allowedAddresses.includes(to))
    )
    log(`allowAllowedAddresses - outcome: ${allow}`)

    return allow
  }

  private async allowAmountPerMonth(
    payload: UnsignedTransaction,
    txDetails: IAirGapTransaction[],
    history: IACHistoryEntry[],
    amountPerMonth: number
  ): Promise<boolean> {
    const relevantHistory: IACHistoryEntry[] = history
      .filter((item) => item.details.every((detail) => detail.protocol === txDetails[0].protocolIdentifier))
      .filter((item) => item.details.every((detail) => detail.type === IACMessageType.TransactionSignResponse))
      .filter((item) => item.details.every((detail) => detail.publicKey && detail.publicKey === payload.publicKey))
      .filter((item) => item.date > new Date().getTime() - MONTH)

    // Eliminate duplicates, because we don't have an ID, the only reliable way is to look at the payload/message
    const myMap: Map<string, IACHistoryEntry> = new Map<string, IACHistoryEntry>()
    relevantHistory.forEach((item) => {
      myMap.set(JSON.stringify(item.message), item)
    })

    const deDuplicatedHistory: IACHistoryEntry[] = Array.from(myMap.values())

    const allow: boolean = deDuplicatedHistory
      .reduce((pv, cv) => pv.plus(cv.details.reduce((pcv, ccv) => pcv.plus(ccv.amount), new BigNumber(0))), new BigNumber(0))
      .isLessThan(amountPerMonth)
    log(`allowAmountPerMonth - outcome: ${allow}`)

    return allow
  }

  private async allowAmountPerDay(
    payload: UnsignedTransaction,
    txDetails: IAirGapTransaction[],
    history: IACHistoryEntry[],
    amountPerDay: number
  ): Promise<boolean> {
    const relevantHistory: IACHistoryEntry[] = history
      .filter((item) => item.details.every((detail) => detail.protocol === txDetails[0].protocolIdentifier))
      .filter((item) => item.details.every((detail) => detail.type === IACMessageType.TransactionSignResponse))
      .filter((item) => item.details.every((detail) => detail.publicKey && detail.publicKey === payload.publicKey))
      .filter((item) => item.date > new Date().getTime() - DAY)

    // Eliminate duplicates, because we don't have an ID, the only reliable way is to look at the payload/message
    const myMap: Map<string, IACHistoryEntry> = new Map<string, IACHistoryEntry>()
    relevantHistory.forEach((item) => {
      myMap.set(JSON.stringify(item.message), item)
    })

    const deDuplicatedHistory: IACHistoryEntry[] = Array.from(myMap.values())

    const allow: boolean = deDuplicatedHistory
      .reduce((pv, cv) => pv.plus(cv.details.reduce((pcv, ccv) => pcv.plus(ccv.amount), new BigNumber(0))), new BigNumber(0))
      .isLessThan(amountPerDay)
    log(`allowAmountPerDay - outcome: ${allow}`)

    return allow
  }

  private async allowMaxAmountPerTx(
    _payload: UnsignedTransaction,
    txDetails: IAirGapTransaction[],
    _history: IACHistoryEntry[],
    maxAmountPerTx: number
  ): Promise<boolean> {
    // TODO: How should we handle operation groups? Max is per tx or per group?
    const allow: boolean = txDetails.every((txDetail: IAirGapTransaction) => new BigNumber(txDetail.amount).isLessThan(maxAmountPerTx))
    log(`allowMaxFeesPerTx - outcome: ${allow}`)

    return allow
  }

  private async allowTxsPerMonth(
    payload: UnsignedTransaction,
    txDetails: IAirGapTransaction[],
    history: IACHistoryEntry[],
    txsPerMonth: number
  ): Promise<boolean> {
    const relevantHistory: IACHistoryEntry[] = history
      .filter((item) => item.details.every((detail) => detail.protocol === txDetails[0].protocolIdentifier))
      .filter((item) => item.details.every((detail) => detail.type === IACMessageType.TransactionSignResponse))
      .filter((item) => item.details.every((detail) => detail.publicKey && detail.publicKey === payload.publicKey))
      .filter((item) => item.date > new Date().getTime() - MONTH)

    // Eliminate duplicates, because we don't have an ID, the only reliable way is to look at the payload/message
    const myMap: Map<string, IACHistoryEntry> = new Map<string, IACHistoryEntry>()
    relevantHistory.forEach((item) => {
      myMap.set(JSON.stringify(item.message), item)
    })

    const deDuplicatedHistory: IACHistoryEntry[] = Array.from(myMap.values())

    const allow: boolean = deDuplicatedHistory.length < txsPerMonth
    log(`allowTxsPerMonth - outcome: ${allow}`)

    return allow
  }

  private async allowTxsPerDay(
    payload: UnsignedTransaction,
    txDetails: IAirGapTransaction[],
    history: IACHistoryEntry[],
    txsPerDay: number
  ): Promise<boolean> {
    const relevantHistory: IACHistoryEntry[] = history
      .filter((item) => item.details.every((detail) => detail.protocol === txDetails[0].protocolIdentifier))
      .filter((item) => item.details.every((detail) => detail.type === IACMessageType.TransactionSignResponse))
      .filter((item) => item.details.every((detail) => detail.publicKey && detail.publicKey === payload.publicKey))
      .filter((item) => item.date > new Date().getTime() - DAY)

    // Eliminate duplicates, because we don't have an ID, the only reliable way is to look at the payload/message
    const myMap: Map<string, IACHistoryEntry> = new Map<string, IACHistoryEntry>()
    relevantHistory.forEach((item) => {
      myMap.set(JSON.stringify(item.message), item)
    })

    const deDuplicatedHistory: IACHistoryEntry[] = Array.from(myMap.values())

    const allow: boolean = deDuplicatedHistory.length < txsPerDay
    log(`allowTxsPerDay - ${deDuplicatedHistory.length} < ${txsPerDay} outcome: ${allow}`)

    return allow
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
