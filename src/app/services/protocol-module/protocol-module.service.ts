import { flattened, ICoinProtocolAdapter } from '@airgap/angular-core'
import { AeternityModule } from '@airgap/aeternity/v1'
import { AeternityTransactionValidatorFactory } from '@airgap/aeternity/v1/serializer/v3/validators/transaction-validator'
import { aeternityValidators } from '@airgap/aeternity/v1/serializer/v3/validators/validators'
import { AstarModule } from '@airgap/astar/v1'
import { AstarTransactionValidatorFactory } from '@airgap/astar/v1/serializer/v3/validators/transaction-validator'
import { astarValidators } from '@airgap/astar/v1/serializer/v3/validators/validators'
import { BitcoinModule } from '@airgap/bitcoin/v1'
import { BitcoinTransactionValidatorFactory } from '@airgap/bitcoin/v1/serializer/v3/validators/transaction-validators'
import { bitcoinValidators } from '@airgap/bitcoin/v1/serializer/v3/validators/validators'
import { ICoinProtocol, MainProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core'
import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { CosmosModule } from '@airgap/cosmos/v1'
import { CosmosTransactionValidatorFactory } from '@airgap/cosmos/v1/serializer/v3/validators/transaction-validators'
import { CosmosTransaction } from '@airgap/cosmos/v1/data/transaction/CosmosTransaction'
import { CosmosTransactionSignRequest } from '@airgap/cosmos/v1/serializer/v3/schemas/definitions/transaction-sign-request-cosmos'
import { EthereumModule } from '@airgap/ethereum/v1'
import { EthereumTransactionValidatorFactory } from '@airgap/ethereum/v1/serializer/v3/validators/transaction-validator'
import { GroestlcoinModule } from '@airgap/groestlcoin/v1'
import { GroestlcoinTransactionValidatorFactory } from '@airgap/groestlcoin/v1/serializer/v3/validators/transaction-validator'
import { groestlcoinValidators } from '@airgap/groestlcoin/v1/serializer/v3/validators/validators'
import { AirGapBlockExplorer, AirGapModule, AirGapOfflineProtocol, ProtocolConfiguration } from '@airgap/module-kit'
import { MoonbeamModule } from '@airgap/moonbeam/v1'
import { MoonbeamTransactionValidatorFactory } from '@airgap/moonbeam/v1/serializer/v3/validators/transaction-validator'
import { moonbeamValidators } from '@airgap/moonbeam/v1/serializer/v3/validators/validators'
import { PolkadotModule } from '@airgap/polkadot/v1'
import { PolkadotTransactionValidatorFactory } from '@airgap/polkadot/v1/serializer/v3/validators/transaction-validator'
import { polkadotValidators } from '@airgap/polkadot/v1/serializer/v3/validators/validators'
import { TezosModule } from '@airgap/tezos/v1'
import { TezosTransactionValidatorFactory } from '@airgap/tezos/v1/serializer/v3/validators/transaction-validator'
import { tezosValidators } from '@airgap/tezos/v1/serializer/v3/validators/validators'
import { Injectable } from '@angular/core'
import { IACMessageType, SerializerV3 } from '@airgap/serializer'


@Injectable({
  providedIn: 'root'
})
export class ProtocolModuleService {
  
  public async loadProtocols(): Promise<{ active: ICoinProtocol[], passive: ICoinProtocol[] }> {
    const modules: AirGapModule[] = [
      new AeternityModule(),
      new AstarModule(),
      new BitcoinModule(),
      new CosmosModule(),
      new EthereumModule(),
      new GroestlcoinModule(),
      new MoonbeamModule(),
      new PolkadotModule(),
      new TezosModule()
    ]

    const activeProtocols: ICoinProtocol[][] = await Promise.all(modules.map((module: AirGapModule) => {
      const offlineProtocols: string[] = Object.entries(module.supportedProtocols)
        .filter(([_, configuration]: [string, ProtocolConfiguration]) => configuration.type === 'offline' || configuration.type === 'full')
        .map(([identifier, _]: [string, ProtocolConfiguration]) => identifier)

        return Promise.all(offlineProtocols.map(async (identifier: string) => {
          const [protocol, blockExplorer]: [AirGapOfflineProtocol, AirGapBlockExplorer] = await Promise.all([
            module.createOfflineProtocol(identifier),
            module.createBlockExplorer(identifier)
          ])

          return new ICoinProtocolAdapter(protocol, blockExplorer)
        }))
    }))

    this.loadSerializerSchemas()

    return {
      active: flattened(activeProtocols),
      passive: []
    }
  }

  private loadSerializerSchemas() {

    // aeternity

    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/aeternity/v1/serializer/v3/schemas/generated/transaction-sign-request-aeternity.json') },
      MainProtocolSymbols.AE
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/aeternity/v1/serializer/v3/schemas/generated/transaction-sign-response-aeternity.json') },
      MainProtocolSymbols.AE
    )
    
    SerializerV3.addValidator(MainProtocolSymbols.AE, new AeternityTransactionValidatorFactory())

    Object.keys(aeternityValidators).forEach((key: string) => {
      validators[key] = aeternityValidators[key]
    })

    // Astar

    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/astar/v1/serializer/v3/schemas/generated/transaction-sign-request-astar.json') },
      MainProtocolSymbols.ASTAR
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/astar/v1/serializer/v3/schemas/generated/transaction-sign-response-astar.json') },
      MainProtocolSymbols.ASTAR
    )
    
    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/astar/v1/serializer/v3/schemas/generated/transaction-sign-request-astar.json') },
      MainProtocolSymbols.SHIDEN
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/astar/v1/serializer/v3/schemas/generated/transaction-sign-response-astar.json') },
      MainProtocolSymbols.SHIDEN
    )

    const astarTransactionValidatorFactory: AstarTransactionValidatorFactory = new AstarTransactionValidatorFactory()

    SerializerV3.addValidator(MainProtocolSymbols.ASTAR, astarTransactionValidatorFactory)
    SerializerV3.addValidator(MainProtocolSymbols.SHIDEN, astarTransactionValidatorFactory)

    Object.keys(astarValidators).forEach((key: string) => {
      validators[key] = astarValidators[key]
    })

    // Bitcoin

    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/bitcoin/v1/serializer/v3/schemas/generated/transaction-sign-request-bitcoin-segwit.json') },
      MainProtocolSymbols.BTC_SEGWIT
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/bitcoin/v1/serializer/v3/schemas/generated/transaction-sign-response-bitcoin-segwit.json') },
      MainProtocolSymbols.BTC_SEGWIT
    )
    
    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/bitcoin/v1/serializer/v3/schemas/generated/transaction-sign-request-bitcoin.json') },
      MainProtocolSymbols.BTC
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/bitcoin/v1/serializer/v3/schemas/generated/transaction-sign-response-bitcoin.json') },
      MainProtocolSymbols.BTC
    )
    
    SerializerV3.addValidator(MainProtocolSymbols.BTC, new BitcoinTransactionValidatorFactory())

    Object.keys(bitcoinValidators).forEach((key: string) => {
      validators[key] = bitcoinValidators[key]
    })

    // Cosmos

    function unsignedTransactionTransformer(value: CosmosTransactionSignRequest): CosmosTransactionSignRequest {
      value.transaction = CosmosTransaction.fromJSON(value.transaction) as any
    
      return value
    }

    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/cosmos/v1/serializer/v3/schemas/generated/transaction-sign-request-cosmos.json'), transformer: unsignedTransactionTransformer },
      MainProtocolSymbols.COSMOS
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/cosmos/v1/serializer/v3/schemas/generated/transaction-sign-response-cosmos.json') },
      MainProtocolSymbols.COSMOS
    )
    
    SerializerV3.addValidator(MainProtocolSymbols.COSMOS, new CosmosTransactionValidatorFactory())

    // Ethereum

    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/ethereum/v1/serializer/v3/schemas/generated/transaction-sign-request-ethereum.json') },
      MainProtocolSymbols.ETH
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/ethereum/v1/serializer/v3/schemas/generated/transaction-sign-request-ethereum-typed.json') },
      MainProtocolSymbols.ETH
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/ethereum/v1/serializer/v3/schemas/generated/transaction-sign-response-ethereum.json') },
      MainProtocolSymbols.ETH
    )
    
    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/ethereum/v1/serializer/v3/schemas/generated/transaction-sign-request-ethereum.json') },
      SubProtocolSymbols.ETH_ERC20
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/ethereum/v1/serializer/v3/schemas/generated/transaction-sign-response-ethereum.json') },
      SubProtocolSymbols.ETH_ERC20
    )
    
    SerializerV3.addValidator(MainProtocolSymbols.ETH, new EthereumTransactionValidatorFactory())

    // Groestlcoin

    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/groestlcoin/v1/serializer/v3/schemas/generated/transaction-sign-request-groestlcoin.json') },
      MainProtocolSymbols.GRS
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/groestlcoin/v1/serializer/v3/schemas/generated/transaction-sign-response-groestlcoin.json') },
      MainProtocolSymbols.GRS
    )

    SerializerV3.addValidator(MainProtocolSymbols.GRS, new GroestlcoinTransactionValidatorFactory())

    Object.keys(groestlcoinValidators).forEach((key: string) => {
      validators[key] = groestlcoinValidators[key]
    })

    // Moonbeam

    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/moonbeam/v1/serializer/v3/schemas/generated/transaction-sign-request-moonbeam.json') },
      MainProtocolSymbols.MOONBEAM
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/moonbeam/v1/serializer/v3/schemas/generated/transaction-sign-response-moonbeam.json') },
      MainProtocolSymbols.MOONBEAM
    )
    
    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/moonbeam/v1/serializer/v3/schemas/generated/transaction-sign-request-moonbeam.json') },
      MainProtocolSymbols.MOONRIVER
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/moonbeam/v1/serializer/v3/schemas/generated/transaction-sign-response-moonbeam.json') },
      MainProtocolSymbols.MOONRIVER
    )

    const moonbeamTransactionValidatorFactory: MoonbeamTransactionValidatorFactory = new MoonbeamTransactionValidatorFactory()

    SerializerV3.addValidator(MainProtocolSymbols.MOONBEAM, moonbeamTransactionValidatorFactory)
    SerializerV3.addValidator(MainProtocolSymbols.MOONRIVER, moonbeamTransactionValidatorFactory)

    Object.keys(moonbeamValidators).forEach((key: string) => {
      validators[key] = moonbeamValidators[key]
    })

    // Polkadot

    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/polkadot/v1/serializer/v3/schemas/generated/transaction-sign-request-polkadot.json') },
      MainProtocolSymbols.POLKADOT
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/polkadot/v1/serializer/v3/schemas/generated/transaction-sign-response-polkadot.json') },
      MainProtocolSymbols.POLKADOT
    )
    
    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/polkadot/v1/serializer/v3/schemas/generated/transaction-sign-request-polkadot.json') },
      MainProtocolSymbols.KUSAMA
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/polkadot/v1/serializer/v3/schemas/generated/transaction-sign-response-polkadot.json') },
      MainProtocolSymbols.KUSAMA
    )

    const polkadotTransactionValidatorFactory: PolkadotTransactionValidatorFactory = new PolkadotTransactionValidatorFactory()

    SerializerV3.addValidator(MainProtocolSymbols.POLKADOT, polkadotTransactionValidatorFactory)
    SerializerV3.addValidator(MainProtocolSymbols.KUSAMA, polkadotTransactionValidatorFactory)

    Object.keys(polkadotValidators).forEach((key: string) => {
      validators[key] = polkadotValidators[key]
    })

    // Tezos

    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-request-tezos.json') },
      MainProtocolSymbols.XTZ
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-response-tezos.json') },
      MainProtocolSymbols.XTZ
    )
    
    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-request-tezos-sapling.json') },
      MainProtocolSymbols.XTZ_SHIELDED
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-response-tezos-sapling.json') },
      MainProtocolSymbols.XTZ_SHIELDED
    )
    
    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-request-tezos.json') },
      SubProtocolSymbols.XTZ_BTC
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-response-tezos.json') },
      SubProtocolSymbols.XTZ_BTC
    )
    
    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-request-tezos.json') },
      SubProtocolSymbols.XTZ_ETHTZ
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-response-tezos.json') },
      SubProtocolSymbols.XTZ_ETHTZ
    )
    
    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-request-tezos.json') },
      SubProtocolSymbols.XTZ_KUSD
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-response-tezos.json') },
      SubProtocolSymbols.XTZ_KUSD
    )
    
    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-request-tezos.json') },
      SubProtocolSymbols.XTZ_KT
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-response-tezos.json') },
      SubProtocolSymbols.XTZ_KT
    )
    
    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-request-tezos.json') },
      SubProtocolSymbols.XTZ_USD
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-response-tezos.json') },
      SubProtocolSymbols.XTZ_USD
    )
    
    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-request-tezos.json') },
      SubProtocolSymbols.XTZ_USDT
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-response-tezos.json') },
      SubProtocolSymbols.XTZ_USDT
    )
    
    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-request-tezos.json') },
      SubProtocolSymbols.XTZ_UUSD
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-response-tezos.json') },
      SubProtocolSymbols.XTZ_UUSD
    )
    
    SerializerV3.addSchema(
      IACMessageType.TransactionSignRequest,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-request-tezos.json') },
      SubProtocolSymbols.XTZ_YOU
    )
    SerializerV3.addSchema(
      IACMessageType.TransactionSignResponse,
      { schema: require('@airgap/tezos/v1/serializer/v3/schemas/generated/transaction-sign-response-tezos.json') },
      SubProtocolSymbols.XTZ_YOU
    )

    const tezosTransactionValidatorFactory: TezosTransactionValidatorFactory = new TezosTransactionValidatorFactory()

    SerializerV3.addValidator(MainProtocolSymbols.XTZ, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(MainProtocolSymbols.XTZ, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(MainProtocolSymbols.XTZ_SHIELDED, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(MainProtocolSymbols.XTZ_SHIELDED, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(SubProtocolSymbols.XTZ_BTC, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(SubProtocolSymbols.XTZ_BTC, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(SubProtocolSymbols.XTZ_ETHTZ, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(SubProtocolSymbols.XTZ_ETHTZ, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(SubProtocolSymbols.XTZ_KUSD, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(SubProtocolSymbols.XTZ_KUSD, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(SubProtocolSymbols.XTZ_KT, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(SubProtocolSymbols.XTZ_KT, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(SubProtocolSymbols.XTZ_USD, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(SubProtocolSymbols.XTZ_USD, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(SubProtocolSymbols.XTZ_USDT, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(SubProtocolSymbols.XTZ_USDT, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(SubProtocolSymbols.XTZ_UUSD, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(SubProtocolSymbols.XTZ_UUSD, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(SubProtocolSymbols.XTZ_YOU, tezosTransactionValidatorFactory)
    SerializerV3.addValidator(SubProtocolSymbols.XTZ_YOU, tezosTransactionValidatorFactory)

    Object.keys(tezosValidators).forEach((key: string) => {
      validators[key] = tezosValidators[key]
    })
  }
}