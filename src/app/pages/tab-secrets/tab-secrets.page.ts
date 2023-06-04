import { Component } from '@angular/core'
import { ModalController, PopoverController } from '@ionic/angular'
import { MnemonicSecret } from '../../models/secret'
import { Observable } from 'rxjs'
import { SecretsService } from 'src/app/services/secrets/secrets.service'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { TabSecretPopoverComponent } from './tab-secret-popover/tab-secret-popover.component'
import { ModeService } from 'src/app/services/mode/mode.service'
import { ModeStrategy } from 'src/app/services/mode/strategy/ModeStrategy'

@Component({
  selector: 'airgap-tab-secrets',
  templateUrl: './tab-secrets.page.html',
  styleUrls: ['./tab-secrets.page.scss']
})
export class TabSecretsPage {
  public secrets: Observable<MnemonicSecret[]>
  public secretFilter: string | undefined

  constructor(
    private readonly popoverCtrl: PopoverController,
    public modalController: ModalController,
    public navigationService: NavigationService,
    private secretsService: SecretsService,
    private readonly modeService: ModeService
  ) {
    this.secrets = this.secretsService.getSecretsObservable()
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

  public async presentPopover(event: Event): Promise<void> {
    const popover = await this.popoverCtrl.create({
      component: TabSecretPopoverComponent,
      componentProps: {
        onClickNewSecret: (): void => {
          popover.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
        },
        onClickSyncWallets: (): void => {
          this.syncWallets()
          popover.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
        }
      },
      event,
      translucent: true
    })

    popover.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  public async syncWallets(): Promise<void> {
    const strategy: ModeStrategy = await this.modeService.strategy()
    await strategy.syncAll()
  }
}
