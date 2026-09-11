import { Component, AfterContentInit, ElementRef, ViewChild } from '@angular/core'
import { ModalController, NavParams } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { SecureStorageService } from '../../services/secure-storage/secure-storage.service'

export enum Warning {
  SECURE_STORAGE,
  ROOT,
  SCREENSHOT,
  NETWORK
}

@Component({
  selector: 'airgap-warning-modal',
  templateUrl: './warning-modal.page.html',
  styleUrls: ['./warning-modal.page.scss']
})
export class WarningModalPage implements AfterContentInit {
  @ViewChild('warningTitle')
  private readonly warningTitle?: ElementRef<HTMLElement>

  private readonly errorType: Warning

  public title: string
  public description: string
  public imageUrl: string | undefined = undefined
  public handler: () => void = () => undefined
  public buttonText: string | undefined = undefined

  constructor(
    public navParams: NavParams,
    private readonly secureStorageService: SecureStorageService,
    private readonly modalController: ModalController,
    private readonly translateService: TranslateService
  ) {}

  public ngAfterContentInit(): void {
    if (this.errorType === Warning.ROOT) {
      this.translateService.get(['warnings-modal.root.title', 'warnings-modal.root.description']).subscribe((values) => {
        this.title = values['warnings-modal.root.title']
        this.description = values['warnings-modal.root.description']
      })
      this.imageUrl = './assets/img/root_detection.svg'
      this.handler = (): void => undefined
    }
    if (this.errorType === Warning.SCREENSHOT) {
      this.translateService.get(['warnings-modal.screenshot.title', 'warnings-modal.screenshot.description']).subscribe((values) => {
        this.title = values['warnings-modal.screenshot.title']
        this.description = values['warnings-modal.screenshot.description']
      })
      this.imageUrl = './assets/img/screenshot_detected.svg'
      this.buttonText = 'Ok'
      this.handler = () => {
        this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
      }
    }

    if (this.errorType === Warning.SECURE_STORAGE) {
      this.translateService
        .get([
          'warnings-modal.secure-storage.title',
          'warnings-modal.secure-storage.description',
          'warnings-modal.secure-storage.button-text_label'
        ])
        .subscribe((values) => {
          this.title = values['warnings-modal.secure-storage.title']
          this.description = values['warnings-modal.secure-storage.description']
          this.buttonText = values['warnings-modal.secure-storage.button-text_label']
        })
      this.imageUrl = './assets/img/screenshot_detected.svg'
      this.handler = (): void => {
        this.secureStorageService.secureDevice().catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
      }
    }

    if (this.errorType === Warning.NETWORK) {
      this.translateService.get(['warnings-modal.network.title', 'warnings-modal.network.description']).subscribe((values) => {
        this.title = values['warnings-modal.network.title']
        this.description = values['warnings-modal.network.description']
      })
      this.imageUrl = './assets/img/network_connection.svg'
      this.handler = (): void => undefined
    }
  }

  public ionViewDidEnter(): void {
    this.focusWarningTitle()
  }

  private focusWarningTitle(): void {
    // Ionic focuses the modal host after presentation. Defer to move focus to
    // the real heading once the dialog content is present.
    setTimeout(() => this.warningTitle?.nativeElement.focus())
  }
}
