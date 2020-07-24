import { Component } from '@angular/core'
import { Observable } from 'rxjs'
import { Secret } from '../../models/secret'
import { ClipboardService } from '../../services/clipboard/clipboard.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { SchemeRoutingService } from '../../services/scheme-routing/scheme-routing.service'
import { SecretsService } from '../../services/secrets/secrets.service'
import { SerializerService } from '../../services/serializer/serializer.service'

@Component({
  selector: 'airgap-tab-settings',
  templateUrl: './tab-settings.page.html',
  styleUrls: ['./tab-settings.page.scss']
})
export class TabSettingsPage {
  public readonly secrets: Observable<Secret[]>

  constructor(
    public readonly serializerService: SerializerService,
    private readonly secretsService: SecretsService,
    private readonly schemeRoutingService: SchemeRoutingService,
    private readonly clipboardService: ClipboardService,
    private readonly navigationService: NavigationService
  ) {
    this.secrets = this.secretsService.getSecretsObservable()
  }

  public goToNewSecret(): void {
    this.navigationService.route('/secret-create').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToEditSecret(secret: Secret): void {
    this.navigationService.routeWithState('/secret-edit', { secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public goToAbout(): void {
    this.navigationService.route('/about').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public pasteClipboard(): void {
    this.clipboardService.paste().then(
      (text: string) => {
        this.schemeRoutingService.handleNewSyncRequest(text).catch(handleErrorLocal(ErrorCategory.SCHEME_ROUTING))
      },
      (err: string) => {
        console.error('Error: ' + err)
      }
    )
  }

  public switchSerializerVersion(event: TouchEvent): void {
    console.log((event.detail as any).checked)
    this.serializerService.useV2 = (event.detail as any).checked
  }
  public qrMsChanged(event: TouchEvent): void {
    console.log((event.detail as any).value)
    this.serializerService.displayTimePerChunk = (event.detail as any).value
  }
  public qrBytesChanged(event: TouchEvent): void {
    console.log((event.detail as any).value)
    this.serializerService.chunkSize = (event.detail as any).value
  }
}
