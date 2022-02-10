import { Component } from '@angular/core'
import { Observable } from 'rxjs'

import { MnemonicSecret } from '../../models/secret'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { ClipboardService, IACMessageTransport, SerializerService } from '@airgap/angular-core'
import { IACService } from 'src/app/services/iac/iac.service'

@Component({
  selector: 'airgap-tab-settings',
  templateUrl: './tab-settings.page.html',
  styleUrls: ['./tab-settings.page.scss']
})
export class TabSettingsPage {
  public readonly secrets: Observable<MnemonicSecret[]>

  constructor(
    public readonly serializerService: SerializerService,
    private readonly secretsService: SecretsService,
    private readonly iacService: IACService,
    private readonly clipboardService: ClipboardService,
    private readonly navigationService: NavigationService
  ) {
    this.secrets = this.secretsService.getSecretsObservable()
  }

  public goToAbout(): void {
    this.navigationService.route('/about').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToInteractionHistory(): void {
    this.navigationService.route('/interaction-history').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToInteractionSettings(): void {
    this.navigationService.route('/interaction-selection-settings').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToErrorHistory(): void {
    this.navigationService.route('/error-history').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToQrSettings(): void {
    this.navigationService.route('/qr-settings').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToBip39Wordlist(): void {
    this.navigationService.route('/wordlist').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToDangerZone(): void {
    this.navigationService.route('/danger-zone').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public pasteClipboard(): void {
    this.clipboardService.paste().then(
      (text: string) => {
        console.log('pasteClipboard', text)
        this.iacService.handleRequest(text, IACMessageTransport.PASTE).catch((err) => console.error(err))
      },
      (err: string) => {
        console.error('Error: ' + err)
      }
    )
  }
}
