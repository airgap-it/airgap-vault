import { Injectable } from '@angular/core'
import { IACMessageDefinitionObject, Serializer } from 'airgap-coin-lib'
import { DeserializedSyncProtocol, SyncProtocolUtils } from 'airgap-coin-lib/dist/serializer/v1/serializer'

import { parseIACUrl } from '../../utils/utils'

@Injectable({
  providedIn: 'root'
})
export class SerializerService {
  private readonly syncProtocolUtils: SyncProtocolUtils = new SyncProtocolUtils()
  private readonly serializer: Serializer = new Serializer()

  private readonly v1Tov2Mapping: Map<number, number> = new Map<number, number>()
  private readonly v2Tov1Mapping: Map<number, number> = new Map<number, number>()

  public useV2: boolean = false
  public chunkSize: number = 250
  public displayTimePerChunk: number = 500

  constructor() {
    this.v1Tov2Mapping.set(2, 4) // AccountShareResponse
    this.v1Tov2Mapping.set(0, 5) // TransactionSignRequest
    this.v1Tov2Mapping.set(1, 6) // TransactionSignResponse

    Array.from(this.v1Tov2Mapping.entries()).forEach((value: [number, number]) => {
      this.v2Tov1Mapping.set(value[1], value[0])
    })
  }

  public async serialize(chunks: IACMessageDefinitionObject[]): Promise<string[]> {
    if (!this.useV2 && !chunks.some((chunk: IACMessageDefinitionObject) => chunk.protocol === 'cosmos')) {
      return [await this.serializeV1(chunks[0])]
    } else {
      return this.serializeV2(chunks)
    }
  }

  public async deserialize(chunks: string | string[]): Promise<IACMessageDefinitionObject[]> {
    const parsedChunks: string[] = parseIACUrl(chunks, 'd')
    try {
      return await this.deserializeV2(parsedChunks)
    } catch (error) {
      return [await this.deserializeV1(parsedChunks[0])]
    }
  }

  private async serializeV1(chunk: IACMessageDefinitionObject): Promise<string> {
    const chunkToSerialize: DeserializedSyncProtocol = {
      type: this.v2Tov1Mapping.get(chunk.type),
      protocol: chunk.protocol,
      payload: chunk.payload as any
    }

    return this.syncProtocolUtils.serialize(chunkToSerialize)
  }

  private async serializeV2(chunks: IACMessageDefinitionObject[]): Promise<string[]> {
    return this.serializer.serialize(chunks, this.chunkSize)
  }

  private async deserializeV1(chunk: string): Promise<IACMessageDefinitionObject> {
    const deserialized: DeserializedSyncProtocol = await this.syncProtocolUtils.deserialize(chunk)

    const iacMessage: IACMessageDefinitionObject = {
      type: this.v1Tov2Mapping.get(deserialized.type),
      protocol: deserialized.protocol,
      payload: deserialized.payload as any
    }

    return iacMessage
  }

  private async deserializeV2(chunks: string[]): Promise<IACMessageDefinitionObject[]> {
    return this.serializer.deserialize(chunks)
  }
}
