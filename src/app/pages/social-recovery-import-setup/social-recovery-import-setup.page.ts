import { Component, OnInit } from '@angular/core'
import { handleErrorLocal, ErrorCategory } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-social-recovery-import-setup',
  templateUrl: './social-recovery-import-setup.page.html',
  styleUrls: ['./social-recovery-import-setup.page.scss']
})
export class SocialRecoveryImportSetupPage implements OnInit {
  public numberOfShares: number = 0

  constructor(private readonly navigationService: NavigationService) {}

  ngOnInit() {}

  public setNumberOfShares(i: number): void {
    this.numberOfShares = i
  }

  //TODO Tim: next state, implement new page for recovery (social-recovery-import-share-name)
  nextState() {
    this.navigationService
      .routeWithState('/social-recovery-import-share-name', { numberOfShares: this.numberOfShares })
      .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
