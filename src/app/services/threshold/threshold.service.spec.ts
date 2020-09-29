import { TestBed } from '@angular/core/testing'
import { IACMessageType } from 'airgap-coin-lib'
import { MainProtocolSymbols } from 'airgap-coin-lib/dist/utils/ProtocolSymbols'

import { StorageMock } from '../../../../test-config/storage-mock'
import { UnitHelper } from '../../../../test-config/unit-test-helper'

import {
  AeternitySpendingThresholds,
  BitcoinSpendingThresholds,
  CosmosSpendingThresholds,
  EthereumSpendingThresholds,
  SubstrateSpendingThresholds,
  TezosSpendingThresholds,
  Thresholds,
  ThresholdService
} from './threshold.service'

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
    [MainProtocolSymbols.AE]: {},
    [MainProtocolSymbols.BTC]: {},
    [MainProtocolSymbols.COSMOS]: {},
    [MainProtocolSymbols.ETH]: {},
    [MainProtocolSymbols.GRS]: {},
    [MainProtocolSymbols.KUSAMA]: {},
    [MainProtocolSymbols.POLKADOT]: {},
    [MainProtocolSymbols.XTZ]: {}
  }
}

interface ThresholdTestCase {
  input: Thresholds
  key: string
  value: any
  output: Thresholds
  error: string
}

const cases: ThresholdTestCase[] = [
  {
    input: defaultObject,
    key: 'global',
    value: 'test',
    output: undefined,
    error: '"global":"test" - New value is not of the same type as the old value'
  },
  {
    input: defaultObject,
    key: 'global.app.showMnemonicAgain',
    value: 'test',
    output: undefined,
    error: '"global.app.showMnemonicAgain":"test" - New value is not of the same type as the old value'
  },
  {
    input: defaultObject,
    key: 'global.app.showMnemonicAgain',
    value: true,
    output: { ...defaultObject, global: { ...defaultObject.global, app: { ...defaultObject.global.app, showMnemonicAgain: true } } },
    error: undefined
  },
  {
    input: defaultObject,
    key: 'global.message.1',
    value: false,
    output: { ...defaultObject, global: { ...defaultObject.global, message: { ...defaultObject.global.message, '1': false } } },
    error: undefined
  },
  {
    input: defaultObject,
    key: 'global.message.100',
    value: false,
    output: undefined,
    error: `"global.message.100":"false" - New value is not of the same type as the old value`
  },
  {
    input: defaultObject,
    key: 'protocol.ae.txsPerDay',
    value: 1,
    output: { ...defaultObject, protocol: { ...defaultObject.protocol, ae: { ...defaultObject.protocol.ae, txsPerDay: 1 } } },
    error: undefined
  },
  {
    input: { ...defaultObject, protocol: { ...defaultObject.protocol, ae: { ...defaultObject.protocol.ae, txsPerDay: 1 } } },
    key: 'protocol.ae.txsPerDay',
    value: null,
    output: defaultObject,
    error: undefined
  }
]

fdescribe('ThresholdService', () => {
  let service: ThresholdService

  beforeEach(() => {
    let unitHelper: UnitHelper
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [{ provide: Storage, useClass: StorageMock }]
      })
    )
      .compileComponents()
      .catch(console.error)

    service = TestBed.inject(ThresholdService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  cases.map((c) => {
    it(`should${c.error ? ' not' : ''} set key "${c.key}" to "${c.value}"`, async () => {
      try {
        const result = await service.applyKeyToObject(c.input, c.key, c.value)

        console.log('res', JSON.stringify(result))

        expect(result).toEqual(c.output)
      } catch (err) {
        if (c.output === undefined && c.error) {
          expect(err.message).toEqual(c.error)
        } else {
          throw err
        }
      }
    })
  })
})
