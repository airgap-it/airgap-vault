import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { AlertController, ModalController } from '@ionic/angular'
import { handleErrorLocal, ErrorCategory } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

import * as bip39 from 'bip39'
import { Observable, Subject } from 'rxjs'
import { BIPSigner } from 'src/app/models/BIP39Signer'
import { DeviceService } from 'src/app/services/device/device.service'
import { map } from 'rxjs/operators'
import { MnemonicSecret } from '../../models/secret'
import { SocialRecoveryImportShareService } from 'src/app/social-recovery-import-share/social-recovery-import-share.service'

type SingleWord = string

@Component({
  selector: 'airgap-social-recovery-import-share-validate',
  templateUrl: './social-recovery-import-share-validate.page.html',
  styleUrls: ['./social-recovery-import-share-validate.page.scss']
})
export class SocialRecoveryImportShareValidatePage implements OnInit {
  public currentShareNumber: number = 1
  public numberOfShares: number = 5
  private sharesMap: Map<number, { shareName: string; share: string[] }>

  public secretWords: string[] = []
  public secretWordsValid: Observable<boolean>
  public selectedWordIndex: number = 0
  public selectedWord: string = ''

  public maskWords: boolean = false

  public wordList: SingleWord[] = bip39.wordlists.EN as any

  public lastWordOptions: string[] = []

  public setWordEmitter: Subject<string> = new Subject()

  public keyboardEnabled: boolean = true

  private maxWords: number = 24

  shareName: string = ''

  @ViewChild('secretContainer', { read: ElementRef })
  public secretContainer: ElementRef<HTMLElement>

  constructor(
    private readonly modalController: ModalController,
    private navigationService: NavigationService,
    private readonly deviceService: DeviceService,
    private readonly alertController: AlertController,
    private readonly socialRecoveryImportShareService: SocialRecoveryImportShareService
  ) {
    this.secretWordsValid = this.setWordEmitter.pipe(
      map(() => {
        const isShorterThanMaxLength = this.selectedWordIndex === -1 && this.secretWords.length < this.maxWords
        const isEditingWord = this.selectedWordIndex !== -1
        this.keyboardEnabled = isShorterThanMaxLength || isEditingWord
        return this.isValid()
      })
    )
  }

  ionViewWillEnter() {
    const state = this.navigationService?.getState()

    this.currentShareNumber = state.currentShareNumber
    this.numberOfShares = state.numberOfShares
    this.shareName = state.shareName
    this.sharesMap = this.socialRecoveryImportShareService.getMap()
    console.log('this sharesmap', this.sharesMap)
  }

  ngOnInit() {}

  async help() {
    this.modalController
    // TODO Tim: uncomment once merged
    // const modal: HTMLIonModalElement = await this.modalController.create({
    //   component: SocialRecoveryImportHelpPage,
    //   backdropDismiss: false
    // })

    // modal.present().catch(handleErrorLocal(ErrorCategory.IONIC_MODAL))
  }

  selectWord(index: number) {
    this.selectedWordIndex = index
    this.selectedWord = this.secretWords[this.selectedWordIndex]

    this.setWordEmitter.next(this.selectedWord ?? '')
  }

  wordLastSelected(word: string | undefined) {
    if (this.secretWords.length !== 23) {
      return console.error('(wordLastSelected): secret word list is not 23 words long')
    }
    this.selectedWordIndex = 23
    this.wordSelected(word)
  }

  wordSelected(word: string | undefined) {
    if (typeof word === 'undefined') {
      if (this.selectedWordIndex >= 0) {
        this.secretWords.splice(this.selectedWordIndex, 1)
        this.selectWord(Math.max(this.selectedWordIndex - 1, 0))
      } else if (this.selectedWordIndex === -1) {
        this.selectWord(this.secretWords.length - 1)
      }
      this.getLastWord()
      return
    }

    if (this.selectedWordIndex === -1) {
      this.secretWords.push(word)
    } else {
      this.secretWords[this.selectedWordIndex] = word
    }

    this.selectedWordIndex = -1
    this.selectedWord = ''

    this.getLastWord()

    this.setWordEmitter.next(this.selectedWord ?? '')

    if (this.secretContainer) {
      this.secretContainer.nativeElement.scrollTop = this.secretContainer.nativeElement.scrollHeight
    }
  }

  public ionViewDidEnter(): void {
    this.deviceService.enableScreenshotProtection({ routeBack: 'secret-setup' })
  }

  public ionViewWillLeave(): void {
    this.deviceService.disableScreenshotProtection()
  }

  public isValid(): boolean {
    return BIPSigner.validateMnemonic(this.secretWords.join(' '))
  }

  public goToSecretSetupPage(): void {
    const signer: BIPSigner = new BIPSigner()
    const secret: MnemonicSecret = new MnemonicSecret(signer.mnemonicToEntropy(BIPSigner.prepareMnemonic(this.secretWords.join(' '))))
    this.navigationService.routeWithState('secret-add', { secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  public async paste(text: string | undefined) {
    if (BIPSigner.validateMnemonic(text)) {
      this.secretWords = text.split(' ')
      this.selectedWordIndex = -1
      this.selectedWord = ''
      this.setWordEmitter.next(this.selectedWord ?? '')
    } else {
      const alert = await this.alertController.create({
        header: 'Invalid Mnemonic',
        message: 'The text in your clipboard is not a valid mnemonic.',
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

  public async addNewWord() {
    if (this.secretWords.length >= 24) {
      return console.error('(addNewWord): secret word list too long')
    }

    this.secretWords.splice(this.selectedWordIndex + 1, 0, '')
    this.selectedWordIndex++
    this.setWordEmitter.next('')
  }

  public async mask(enabled: boolean) {
    this.maskWords = enabled
  }

  public getLastWord() {
    const options = []
    if (this.secretWords.length === 23) {
      // The last word is 3 bits entropy and 8 bits checksum of the entropy. But because there are only 2048 words, it's fast to just try all combinations and the code is a lot easier, so we do that.
      for (const word of bip39.wordlists.EN) {
        if (bip39.validateMnemonic([...this.secretWords, word].join(' '))) {
          options.push(word)
        }
      }
    }
    this.lastWordOptions = options
  }

  nextState() {
    // TODO Tim

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
      } catch (error) {
        console.error('secret string wrong', error)
      }

      console.log()
      if (secretString) {
        this.navigationService
          .routeWithState('secret-add', { secret: new MnemonicSecret(secretString, 'Recovery by Social Recovery') })
          .catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      } else {
        //TODO Tim: implement error behavior
        console.error('moving to error page')
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

//TODO TIM:
// should have the following from the previous page:
// - name of share
// - number of total shares to import
// - index of current share that is being imported
// - dictionary with sharename, imported share key
// should provide the following for the next page:
// - dictionary with sharenames, imported sharekeys
// - number of total shares to import
// -- if number of total shares > current share index:
// --- increase index +1
// --- go to social-recovery-import-share-name page
// -- else:
// --- go to social-recovery-import-share-finish
