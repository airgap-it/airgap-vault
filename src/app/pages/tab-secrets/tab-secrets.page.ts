import { Component } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { MnemonicSecret } from '../../models/secret'
import { Observable } from 'rxjs'
import { SecretsService } from 'src/app/services/secrets/secrets.service'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-tab-secrets',
  templateUrl: './tab-secrets.page.html',
  styleUrls: ['./tab-secrets.page.scss']
})
export class TabSecretsPage {
  public secrets: Observable<MnemonicSecret[]>
  public secretFilter: string | undefined

  constructor(
    public modalController: ModalController,
    public navigationService: NavigationService,
    private secretsService: SecretsService
  ) {
    this.secrets = this.secretsService.getSecretsObservable()
  }

  // TODO JGD NEXT
  //
  // ✅ add settings icon to top right
  // ✅  add settings page
  // ✅ check multi-secret view (scrolling)
  // -  check very long secret name
  // -  investigate active secret? CurrentSecretComponent
  // -  check secret generation flow

  public goToNewSecret(): void {
    this.navigationService.route('/secret-setup').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async ngOnInit(): Promise<void> {
    this.secrets.subscribe(async (secrets: MnemonicSecret[]) => {
      if (secrets.length === 0) {
        this.navigationService.route('/secret-setup/initial').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      }
    }) // We should never unsubscribe, because we need to watch this in case a user deletes all his secrets
  }

  public filterItems(event: any): void {
    function isValidSymbol(data: unknown): data is string {
      return data && typeof data === 'string' && data !== ''
    }

    const value: unknown = event.target.value

    this.secretFilter = isValidSymbol(value) ? value.trim().toLowerCase() : undefined
  }
}
