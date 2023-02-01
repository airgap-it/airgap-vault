import { flattened, ICoinProtocolAdapter, ICoinSubProtocolAdapter } from '@airgap/angular-core'
import { AeternityModule } from '@airgap/aeternity/v1'
import { AstarModule } from '@airgap/astar/v1'
import { BitcoinModule } from '@airgap/bitcoin/v1'
import { ICoinProtocol, ICoinSubProtocol, ProtocolSymbols } from '@airgap/coinlib-core'
import { CosmosModule } from '@airgap/cosmos/v1'
import { EthereumModule } from '@airgap/ethereum/v1'
import { GroestlcoinModule } from '@airgap/groestlcoin/v1'
import {
  AirGapBlockExplorer,
  AirGapModule,
  AirGapOfflineProtocol,
  AirGapV3SerializerCompanion,
  isSubProtocol,
  ProtocolConfiguration,
  V3SchemaConfiguration
} from '@airgap/module-kit'
import { MoonbeamModule } from '@airgap/moonbeam/v1'
import { PolkadotModule } from '@airgap/polkadot/v1'
import { TezosModule } from '@airgap/tezos/v1'
import { Injectable } from '@angular/core'
import { SerializerV3, TransactionSignRequest, TransactionSignResponse, TransactionValidator } from '@airgap/serializer'
import { ICPModule } from '@airgap/icp/v1'

type LoadedProtocolStatus = 'active' | 'passive'

interface LoadedMainProtocol {
  type: 'main'
  status: LoadedProtocolStatus
  result: ICoinProtocolAdapter
}

interface LoadedSubProtocol {
  type: 'sub'
  status: LoadedProtocolStatus
  result: [ICoinProtocolAdapter, ICoinSubProtocolAdapter]
}

type LoadedProtocol = LoadedMainProtocol | LoadedSubProtocol

@Injectable({
  providedIn: 'root'
})
export class ProtocolModuleService {
  public async loadProtocols(ignore: string[] = []): Promise<{
    activeProtocols: ICoinProtocol[]
    passiveProtocols: ICoinProtocol[]
    activeSubProtocols: [ICoinProtocol, ICoinSubProtocol][]
    passiveSubProtocols: [ICoinProtocol, ICoinSubProtocol][]
  }> {
    const modules: AirGapModule[] = [
      new BitcoinModule(),
      new EthereumModule(),
      new TezosModule(),
      new PolkadotModule(),
      new CosmosModule(),
      new AeternityModule(),
      new GroestlcoinModule(),
      new MoonbeamModule(),
      new AstarModule(),
      new ICPModule()
    ]

    const loadedProtocols: LoadedProtocol[] = await this.loadFromModules(modules, new Set(ignore))

    const activeProtocols: ICoinProtocol[] = []
    const passiveProtocols: ICoinProtocol[] = []

    const activeSubProtocols: [ICoinProtocol, ICoinSubProtocol][] = []
    const passiveSubProtocols: [ICoinProtocol, ICoinSubProtocol][] = []

    for (const protocol of loadedProtocols) {
      if (protocol.type === 'main' && protocol.status === 'active') {
        activeProtocols.push(protocol.result)
      }

      if (protocol.type === 'main' && protocol.status === 'passive') {
        passiveProtocols.push(protocol.result)
      }

      if (protocol.type === 'sub' && protocol.status === 'active') {
        activeSubProtocols.push(protocol.result)
      }

      if (protocol.type === 'sub' && protocol.status === 'passive') {
        passiveSubProtocols.push(protocol.result)
      }
    }

    return {
      activeProtocols,
      passiveProtocols,
      activeSubProtocols,
      passiveSubProtocols
    }
  }

  private async loadFromModules(modules: AirGapModule[], ignore: Set<string>): Promise<LoadedProtocol[]> {
    const protocols: LoadedProtocol[][] = await Promise.all(
      modules.map(async (module: AirGapModule) => {
        const offlineProtocols: string[] = Object.entries(module.supportedProtocols)
          .filter(
            ([identifier, configuration]: [string, ProtocolConfiguration]) =>
              configuration.type === 'offline' || (configuration.type === 'full' && !ignore.has(identifier))
          )
          .map(([identifier, _]: [string, ProtocolConfiguration]) => identifier)

        const v3SerializerCompanion: AirGapV3SerializerCompanion = await module.createV3SerializerCompanion()

        this.loadSerializerValidators(v3SerializerCompanion)

        const activeProtocols: Record<string, ICoinProtocolAdapter> = {}
        const activeSubProtocols: [ICoinProtocolAdapter, ICoinSubProtocolAdapter][] = []

        for (const identifier of offlineProtocols) {
          const adapter: ICoinProtocolAdapter = await this.createProtocolAdapter(module, identifier, v3SerializerCompanion)

          if (adapter instanceof ICoinSubProtocolAdapter) {
            const mainIdentifier: string = await adapter.v1Protocol.mainProtocol()
            if (mainIdentifier! in activeProtocols) {
              const mainAdapter: ICoinProtocolAdapter = await this.createProtocolAdapter(module, mainIdentifier, v3SerializerCompanion)
              activeProtocols[mainIdentifier] = mainAdapter
            }

            activeSubProtocols.push([activeProtocols[mainIdentifier], adapter])
          } else {
            activeProtocols[identifier] = adapter
          }
        }

        const loadedMainProtocols: LoadedProtocol[] = Object.values(activeProtocols).map((protocol) => ({
          type: 'main',
          status: 'active',
          result: protocol
        }))

        const loadedSubProtocols: LoadedProtocol[] = activeSubProtocols.map((protocol) => ({
          type: 'sub',
          status: 'active',
          result: protocol
        }))

        return loadedMainProtocols.concat(loadedSubProtocols)
      })
    )

    return flattened(protocols)
  }

  private async createProtocolAdapter(
    module: AirGapModule,
    identifier: string,
    v3SerializerCompanion: AirGapV3SerializerCompanion
  ): Promise<ICoinProtocolAdapter> {
    const [protocol, blockExplorer]: [AirGapOfflineProtocol, AirGapBlockExplorer] = await Promise.all([
      module.createOfflineProtocol(identifier),
      module.createBlockExplorer(identifier)
    ])

    return isSubProtocol(protocol)
      ? ICoinSubProtocolAdapter.create(protocol, blockExplorer, v3SerializerCompanion)
      : ICoinProtocolAdapter.create(protocol, blockExplorer, v3SerializerCompanion)
  }

  private loadSerializerValidators(v3SerializerCompanion: AirGapV3SerializerCompanion) {
    v3SerializerCompanion.schemas.forEach((configuration: V3SchemaConfiguration) => {
      SerializerV3.addSchema(configuration.type, configuration.schema, configuration.protocolIdentifier as ProtocolSymbols)

      if (configuration.protocolIdentifier) {
        SerializerV3.addValidator(configuration.protocolIdentifier as ProtocolSymbols, {
          create(): TransactionValidator {
            return new GenericTransactionValidator(configuration.protocolIdentifier, v3SerializerCompanion)
          }
        })
      }
    })
  }
}

class GenericTransactionValidator implements TransactionValidator {
  public constructor(private readonly protocolIdentifier: string, private readonly serializerCompanion: AirGapV3SerializerCompanion) {}

  public async validateUnsignedTransaction(transaction: TransactionSignRequest): Promise<any> {
    return this.serializerCompanion.validateTransactionSignRequest(this.protocolIdentifier, transaction)
  }

  public async validateSignedTransaction(transaction: TransactionSignResponse): Promise<any> {
    return this.serializerCompanion.validateTransactionSignResponse(this.protocolIdentifier, transaction)
  }
}
