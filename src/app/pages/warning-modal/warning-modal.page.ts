import { Component, AfterContentInit } from '@angular/core'
import { ModalController, NavParams } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { first } from 'rxjs/operators'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { SecureStorageService } from '../../services/secure-storage/secure-storage.service'
import { VaultStorageKey, VaultStorageService } from '../../services/storage/storage.service'

export enum Warning {
  SECURE_STORAGE,
  ROOT,
  SCREENSHOT,
  NETWORK,
  INITIAL_DISCLAIMER
}

@Component({
  selector: 'airgap-warning-modal',
  templateUrl: './warning-modal.page.html',
  styleUrls: ['./warning-modal.page.scss']
})
export class WarningModalPage implements AfterContentInit {
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
    private readonly storageService: VaultStorageService,
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
        .get(['warnings-modal.secure-storage.title', 'warnings-modal.secure-storage.description'])
        .subscribe((values) => {
          this.title = values['warnings-modal.secure-storage.title']
          this.description = values['warnings-modal.secure-storage.description']
        })
      this.imageUrl = './assets/img/screenshot_detected.svg'
      this.buttonText = 'warnings-modal.secure-storage.button-text_label'
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

    if (this.errorType === Warning.INITIAL_DISCLAIMER) {
      this.translateService
        .get([
          'warnings-modal.disclaimer.title',
          'warnings-modal.disclaimer.text',
          'warnings-modal.disclaimer.disclaimer-list.text',
          'warnings-modal.disclaimer.disclaimer-list.item-1_text',
          'warnings-modal.disclaimer.disclaimer-list.item-2_text',
          'warnings-modal.disclaimer.description',
          'warnings-modal.disclaimer.understood_label'
        ])
        .pipe(first())
        .subscribe((values: string[]) => {
          const title: string = values['warnings-modal.disclaimer.title']
          const text: string = values['warnings-modal.disclaimer.text']
          const listText: string = values['warnings-modal.disclaimer.disclaimer-list.text']
          const listItem1Text: string = values['warnings-modal.disclaimer.disclaimer-list.item-1_text']
          const listItem2Text: string = values['warnings-modal.disclaimer.disclaimer-list.item-2_text']
          const descriptionText: string = values['warnings-modal.disclaimer.description']
          const understoodLabel: string = values['warnings-modal.disclaimer.understood_label']
          this.title = title
          this.description = [
            '<p><strong>',
            text,
            '</strong></p><p>',
            listText,
            '<ul><li>',
            listItem1Text,
            '</li><li>',
            listItem2Text,
            '</li></ul></p><p>',
            descriptionText,
            '</p>'
          ].join('')

          this.imageUrl = undefined
          this.buttonText = understoodLabel
          this.handler = (): void => {
            this.storageService
              .set(VaultStorageKey.DISCLAIMER_INITIAL, true)
              .then(() => {
                this.modalController.dismiss().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
              })
              .catch(handleErrorLocal(ErrorCategory.SECURE_STORAGE))
          }
        })
    }
  }
}
