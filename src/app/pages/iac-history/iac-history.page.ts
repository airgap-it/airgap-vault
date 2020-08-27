import { IACHistoryEntry, IACHistoryService } from '@airgap/angular-core'
import { Component, OnInit } from '@angular/core'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-iac-history',
  templateUrl: './iac-history.page.html',
  styleUrls: ['./iac-history.page.scss']
})
export class IacHistoryPage implements OnInit {
  public entries: IACHistoryEntry[] = []

  constructor(private readonly iacHistoryService: IACHistoryService, private readonly navigationService: NavigationService) {}

  async ngOnInit() {
    this.entries = (await this.iacHistoryService.getAll())
      .filter((entry) => entry.hidden !== true)
      .map((entry) => {
        ;(entry.date as any) = new Date(entry.date)
        return entry
      })
  }

  public async openDetail(entry: IACHistoryEntry) {
    this.navigationService.route(`/interaction-history-detail/${entry.id}`).catch(console.error)
  }
}
