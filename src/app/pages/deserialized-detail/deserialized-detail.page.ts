import { Component } from '@angular/core'
import { IACMessageDefinitionObject, IACMessageType } from 'airgap-coin-lib'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SignTransactionInfo } from 'src/app/models/sign-transaction-info'
import { TranslateService } from '@ngx-translate/core'

// TODO: refactor multiple transactions
@Component({
  selector: 'airgap-deserialized-detail',
  templateUrl: './deserialized-detail.page.html',
  styleUrls: ['./deserialized-detail.page.scss']
})
export class DeserializedDetailPage {
  public broadcastUrl?: string

  public title: string
  public transactionInfos: SignTransactionInfo[]
  public type: IACMessageType
  public signTransactionRequests: IACMessageDefinitionObject[]

  public iacMessageType: IACMessageType

  constructor(
    private readonly navigationService: NavigationService,
    private readonly translateService: TranslateService
  ) { }

  public async ionViewWillEnter(): Promise<void> {
    const state = this.navigationService.getState()
    if (state.transactionInfos) {
      this.transactionInfos = state.transactionInfos
      this.type = state.type
      this.iacMessageType = this.transactionInfos[0].signTransactionRequest.type
      this.signTransactionRequests = this.transactionInfos.map(info => info.signTransactionRequest)

      const display = this.type === IACMessageType.TransactionSignRequest ? 'transaction' : 'message'
      this.title = this.translateService.instant(`deserialized-detail.${display}.title`)
    }
  }
}
