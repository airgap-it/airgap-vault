import { Component } from '@angular/core'
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

  constructor(private readonly navigationService: NavigationService) {
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
    window.open(this.link, '_blank')
  }
}
