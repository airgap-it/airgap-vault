import { IACMessageTransport, ProtocolService, SerializerService } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import {
  IACMessageDefinitionObject,
  IACMessageType,
  IAirGapTransaction,
  ICoinProtocol,
  SignedTransaction,
  UnsignedTransaction
} from 'airgap-coin-lib'
import { ProtocolSymbols } from 'airgap-coin-lib/dist/utils/ProtocolSymbols'
import BigNumber from 'bignumber.js'

import { generateGUID } from '../../utils/utils'
import { VaultStorageKey, VaultStorageService } from '../storage/storage.service'

export interface IACHistoryEntryDetails {
  type: IACMessageType | undefined
  protocol: ProtocolSymbols | undefined
  amount?: string | undefined
  publicKey?: string | undefined
}

export interface IACHistoryEntry {
  id: string
  message: string | string[]
  details: IACHistoryEntryDetails[]
  transport: IACMessageTransport
  outgoing: boolean
  hidden: boolean
  date: number
}

/**
 * A local history of all incoming and outgoing messages.
 *
 * The history is used locally to apply certain rate limits. So the user is not allowed to delete entries, they can only be hidden.
 */
@Injectable({
  providedIn: 'root'
})
export class IACHistoryService {
  constructor(
    private readonly storageService: VaultStorageService,
    private readonly protocolService: ProtocolService,
    private readonly serializerService: SerializerService
  ) {}

  /**
   * Add a new entry to the history
   *
   * @param message The message that was received or will be sent
   * @param status The status of the handling of the message (eg. if we understood it or not)
   * @param transport The transport how the message was received or how it will be sent
   * @param outgoing A flag indicating whether the request is incoming or outgoing
   */
  public async add(message: string | string[], transport: IACMessageTransport, outgoing: boolean): Promise<void> {
    const details = await this.extractDetails(message)

    const entry: IACHistoryEntry = {
      id: generateGUID(),
      message,
      details,
      transport,
      outgoing,
      hidden: false,
      date: new Date().getTime()
    }
    const history = await this.getAll()
    history.unshift(entry)
    await this.store(history)
  }

  /**
   * Return a specific entry by ID
   *
   * @param id EntryID
   */
  public async getById(id: string): Promise<IACHistoryEntry | undefined> {
    const history = await this.getAll()
    return history.find((entry) => entry.id === id)
  }

  /**
   * Return all locally saved entries
   */
  public async getAll(): Promise<IACHistoryEntry[]> {
    return this.storageService.get(VaultStorageKey.IAC_HISTORY)
  }

  /**
   * Hide a certain entry by ID.
   *
   * @param id The ID of the entry that should be hidden
   */
  public async hideById(id: string): Promise<void> {
    const history = await this.getAll()
    const newHistory = history.map((entry) => {
      if (entry.id === id) {
        entry.hidden = true
      }
      return entry
    })
    await this.store(newHistory)
  }

  /**
   * Hide all entries
   */
  public async hideAll(): Promise<void> {
    const history = await this.getAll()
    const newHistory = history.map((entry) => {
      entry.hidden = true
      return entry
    })
    await this.store(newHistory)
  }

  /**
   * Save history locally
   *
   * @param history The history that will be persisted
   */
  private async store(history: IACHistoryEntry[]): Promise<void> {
    await this.storageService.set(VaultStorageKey.IAC_HISTORY, history)
  }

  /**
   * Extract details from a message
   *
   * @param message The message to extract details
   */
  private async extractDetails(message: string | string[]): Promise<IACHistoryEntryDetails[]> {
    const objects: IACMessageDefinitionObject[] = await (async () => {
      try {
        return await this.serializerService.deserialize(message)
      } catch (e) {
        return []
      }
    })()

    return await Promise.all(
      objects.map(async (obj) => {
        const res: IACHistoryEntryDetails = {
          type: obj.type,
          protocol: obj.protocol
        }
        const protocol: ICoinProtocol = await this.protocolService.getProtocol(obj.protocol, undefined, false)
        let txDetails: IAirGapTransaction[] | undefined
        if (obj.type === IACMessageType.TransactionSignRequest) {
          txDetails = await protocol.getTransactionDetails(obj.payload as UnsignedTransaction)
          res.publicKey = (obj.payload as UnsignedTransaction).publicKey
        }
        if (obj.type === IACMessageType.TransactionSignResponse) {
          txDetails = await protocol.getTransactionDetailsFromSigned(obj.payload as SignedTransaction)
        }

        if (txDetails) {
          res.amount = txDetails.reduce((pv, cv) => pv.plus(cv.amount), new BigNumber(0)).toFixed()
        }

        return res
      })
    )
  }
}
