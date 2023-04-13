import { Component, OnInit } from '@angular/core'
import { ContactsService } from 'src/app/services/contacts/contacts.service'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-contact-book-onboarding',
  templateUrl: './contact-book-onboarding.page.html',
  styleUrls: ['./contact-book-onboarding.page.scss']
})
export class ContactBookOnboardingPage implements OnInit {
  public suggestionsEnabled: boolean
  public state: 0 | 1 | 2

  constructor(private readonly contactsService: ContactsService, private readonly navigationService: NavigationService) {
    this.state = 0
  }

  async ngOnInit(): Promise<void> {
    this.contactsService.isSuggestionsEnabled().then((value: boolean) => (this.suggestionsEnabled = value))
  }

  changeState(state: 0 | 1 | 2) {
    this.state = state
  }

  async next() {
    if (this.state < 2) this.state++
    else {
      await this.contactsService.setOnboardingEnable(false)
      await this.contactsService.setBookEnable(true)
      this.navigationService.route('/contact-book-contacts').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }

  prev() {
    if (this.state > 0) this.state--
  }

  async onToggleSuggestion(event: any) {
    const value = event.detail.checked
    await this.contactsService.setSuggestionsEnable(value)
  }
}
