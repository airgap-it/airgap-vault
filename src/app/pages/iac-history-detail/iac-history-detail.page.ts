import {
  ClipboardService,
  IACHistoryEntry,
  IACHistoryService,
  IACMessageTransport,
  ProtocolService,
  SerializerService
} from '@airgap/angular-core'
import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { IACMessageDefinitionObject, IACMessageType, ICoinProtocol, SignedTransaction, UnsignedTransaction } from 'airgap-coin-lib'
import { IACService } from 'src/app/services/iac/iac.service'

@Component({
  selector: 'airgap-iac-history-detail',
  templateUrl: './iac-history-detail.page.html',
  styleUrls: ['./iac-history-detail.page.scss']
})
export class IacHistoryDetailPage {
  public entry: IACHistoryEntry | undefined
  public details: any

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly iacHistoryService: IACHistoryService,
    private readonly serializerService: SerializerService,
    private readonly clipboardService: ClipboardService,
    private readonly protocolService: ProtocolService,
    private readonly iacService: IACService
  ) {
    this.activatedRoute.params.subscribe(async (params) => {
      const historyID = params['historyID']

      this.entry = await this.iacHistoryService.getById(historyID)
      ;(this.entry.date as any) = new Date(this.entry.date)

      this.details = await this.extractDetails(this.entry.message)
    })
  }

  public async copyMessage() {
    this.clipboardService.copyAndShowToast(Array.isArray(this.entry.message) ? this.entry.message.join(',') : this.entry.message)
  }

  public async handle() {
    this.iacService.handleRequest(this.entry.message, IACMessageTransport.PASTE)
  }

  public async send() {
    ;(this.iacService as any).relay(this.entry.message)
  }

  private async extractDetails(message: string | string[]): Promise<any[]> {
    const objects: IACMessageDefinitionObject[] = await (async () => {
      try {
        return await this.serializerService.deserialize(message)
      } catch (e) {
        console.log(e)
        return []
      }
    })()

    return await Promise.all(
      objects.map(async (obj) => {
        const res: any = {
          type: obj.type,
          protocol: obj.protocol,
          payload: obj.payload
        }
        const protocol: ICoinProtocol = await this.protocolService.getProtocol(obj.protocol, undefined, false)

        if (obj.type === IACMessageType.TransactionSignRequest) {
          res.parsedPayload = await protocol.getTransactionDetails(obj.payload as UnsignedTransaction)
        }
        if (obj.type === IACMessageType.TransactionSignResponse) {
          res.parsedPayload = await protocol.getTransactionDetailsFromSigned(obj.payload as SignedTransaction)
        }

        return res
      })
    )
  }
}
