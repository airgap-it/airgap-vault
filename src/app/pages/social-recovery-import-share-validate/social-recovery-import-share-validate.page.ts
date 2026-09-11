import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { handleErrorLocal, ErrorCategory } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

import { BIPSigner } from 'src/app/models/BIP39Signer'
import { DeviceService } from 'src/app/services/device/device.service'
import { MnemonicSecret } from '../../models/secret'
import { SocialRecoveryImportShareService } from 'src/app/social-recovery-import-share/social-recovery-import-share.service'
import { SocialRecoveryImportHelpPage } from '../social-recovery-import-help/social-recovery-import-help.page'
import { SocialRecoveryImportErrorsPage } from '../social-recovery-import-errors/social-recovery-import-errors.page'
import { ModalAccessibilityService } from '../../services/modal-accessibility/modal-accessibility.service'
import { MnemonicInputPage } from '../mnemonic-input.page'

@Component({
  selector: 'airgap-social-recovery-import-share-validate',
  templateUrl: './social-recovery-import-share-validate.page.html',
  styleUrls: ['./social-recovery-import-share-validate.page.scss']
})
export class SocialRecoveryImportShareValidatePage extends MnemonicInputPage implements OnInit {
  public currentShareNumber: number = 1
  public numberOfShares: number = 5
  private sharesMap: Map<number, { shareName: string; share: string[] }>

  shareName: string = ''

  @ViewChild('secretContainer', { read: ElementRef })
  public readonly secretContainer: ElementRef<HTMLElement>

  @ViewChild('seedphraseInput')
  public readonly seedphraseInput: ElementRef<HTMLTextAreaElement>

  constructor(
    private readonly modalAccessibilityService: ModalAccessibilityService,
    private readonly navigationService: NavigationService,
    private readonly deviceService: DeviceService,
    private readonly pageAlertController: AlertController,
    private readonly socialRecoveryImportShareService: SocialRecoveryImportShareService
  ) {
    super(48, pageAlertController)
  }

  ionViewWillEnter() {
    const state = this.navigationService?.getState()

    this.currentShareNumber = state.currentShareNumber
    this.numberOfShares = state.numberOfShares
    this.shareName = state.shareName
    this.sharesMap = this.socialRecoveryImportShareService.getMap()
  }

  ngOnInit() {}

  async help() {
    const modal: HTMLIonModalElement = await this.modalAccessibilityService.create(
      SocialRecoveryImportHelpPage,
      {},
      { backdropDismiss: false },
      { translationKey: 'accessibility.social_recovery_help_title' }
    )

    modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  public ionViewDidEnter(): void {
    this.deviceService.enableScreenshotProtection({ routeBack: 'social-recovery-import-share-validate' })
  }

  public ionViewWillLeave(): void {
    this.deviceService.disableScreenshotProtection()
  }

  public goToSecretSetupPage(): void {
    const signer: BIPSigner = new BIPSigner()
    const secret: MnemonicSecret = new MnemonicSecret(signer.mnemonicToEntropy(BIPSigner.prepareMnemonic(this.secretWords.join(' '))))
    this.navigationService.routeWithState('secret-add', { secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  private splitString(words: string): [string, string] {
    const wordArray = words ? words.split(' ') : []

    const firstHalf = wordArray.slice(0, 24).join(' ')
    const secondHalf = wordArray.slice(24).join(' ')

    return [firstHalf, secondHalf]
  }

  protected isFlowValid(words: string[]): boolean {
    if (words.length !== this.maxWords) {
      return false
    }

    const [firstHalf, secondHalf]: [string, string] = this.splitString(words.join(' '))
    return BIPSigner.validateMnemonic(firstHalf) && BIPSigner.validateMnemonic(secondHalf)
  }

  async nextState() {
    this.socialRecoveryImportShareService.setMap(this.currentShareNumber, this.shareName, this.secretWords)

    this.sharesMap = this.socialRecoveryImportShareService.getMap()
    let shares = Array()
    this.sharesMap.forEach((entry) => {
      shares.push(entry.share)
    })

    if (this.currentShareNumber + 1 === this.numberOfShares) {
      let secretString: string
      try {
        const sharesWithArraysToStrings = shares.map((subArray) => subArray.join(' '))
        secretString = MnemonicSecret.recoverSecretFromShares(sharesWithArraysToStrings)

        this.navigationService
          .routeWithState('/social-recovery-import-success', { secret: new MnemonicSecret(secretString, 'Recovery by Social Recovery') })
          .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      } catch (error) {
        const returnedError = new Error(error)
        if (returnedError.message.includes('Invalid mnemonic') || returnedError.message.includes('Checksum error')) {
          const modal: HTMLIonModalElement = await this.modalAccessibilityService.create(
            SocialRecoveryImportErrorsPage,
            { errorTitle: returnedError.name, errorText: returnedError.message },
            { backdropDismiss: false },
            { translationKey: 'secret-edit.error_alert.title' }
          )

          modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
        } else {
          const alert = await this.pageAlertController.create({
            header: returnedError.name,
            message: returnedError.message,
            backdropDismiss: false,
            buttons: [
              {
                text: 'Ok'
              }
            ]
          })
          alert.present()
        }
      }
    } else {
      this.navigationService
        .routeWithState('social-recovery-import-share-name', {
          currentShareNumber: this.currentShareNumber + 1,
          numberOfShares: this.numberOfShares,
          shareName: this.shareName
        })
        .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
    }
  }
}
