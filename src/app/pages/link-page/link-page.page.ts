import { ClipboardService } from '@airgap/angular-core'
import { Component } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-link-page',
  templateUrl: './link-page.page.html',
  styleUrls: ['./link-page.page.scss']
})
export class LinkPagePage {
  title: string
  link: string
  description: string

  constructor(
    private readonly navigationService: NavigationService,
    private readonly clipboardService: ClipboardService,
    private readonly translateService: TranslateService
  ) {
    const state = this.navigationService.getState()
    if (!state) {
      this.navigationService.routeToSettingsTab(true)
      return
    }
    this.title = state.title
    this.link = state.link
    this.description = state.description
  }

  async open() {
    await this.clipboardService.copyAndShowToast(this.link, this.translateService.instant('link-page.link-clipboard_label'))
  }
}
