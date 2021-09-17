import { Component, OnInit, ViewChild } from '@angular/core'
import { AlertController, IonContent } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { MnemonicSecret } from 'src/app/models/secret'
import { DiceRollService, DiceRollType } from 'src/app/services/dice-roll/dice-roll.service'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-secret-generate-dice',
  templateUrl: './secret-generate-dice.page.html',
  styleUrls: ['./secret-generate-dice.page.scss']
})
export class SecretGenerateDicePage implements OnInit {
  @ViewChild(IonContent, { static: false }) content: IonContent

  public isValid: boolean = false

  public minLength: number = 99

  public error: string = ''

  public entropyBits: number = 0

  public diceRollType: DiceRollType = DiceRollType.DEFAULT

  private entropy: string = ''

  constructor(
    private readonly alertController: AlertController,
    private readonly translateService: TranslateService,
    private readonly navigationService: NavigationService,
    private readonly diceRollService: DiceRollService
  ) {}

  ngOnInit() {}

  async next() {
    const entropy = await this.diceRollService.getEntropyFromInput(this.entropy, this.diceRollType)

    const secret: MnemonicSecret = new MnemonicSecret(entropy)

    this.navigationService.routeWithState('secret-rules', { secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  async updateEntropy(input: string) {
    this.entropy = input
    this.entropyBits = 2.585 * this.entropy.length
    this.validateEntropy()
  }

  async validateEntropy() {
    if (this.entropy.length < 99) {
      this.isValid = false
      this.error = ''
      return
    }

    try {
      this.isValid = await this.diceRollService.validateInput(this.entropy)
    } catch (e) {
      this.isValid = false
      this.error = e
    }
  }

  async switchInputType() {
    if (this.diceRollType === DiceRollType.DEFAULT) {
      this.diceRollType = DiceRollType.COLDCARD
    } else {
      this.diceRollType = DiceRollType.DEFAULT
    }
  }

  scrollToBottom() {
    this.content.scrollToBottom(500)
  }

  async selectInputType() {
    const alert = await this.alertController.create({
      header: this.translateService.instant('secret-generate-dice-roll.type-alert.header'),
      message: this.translateService.instant('secret-generate-dice-roll.type-alert.message'),
      backdropDismiss: false,
      inputs: [
        {
          name: 'default',
          type: 'radio',
          label: this.translateService.instant('secret-generate-dice-roll.type-alert.default'),
          value: DiceRollType.DEFAULT,
          checked: this.diceRollType === DiceRollType.DEFAULT
        },
        {
          name: 'coldcard',
          type: 'radio',
          label: this.translateService.instant('secret-generate-dice-roll.type-alert.coldcard'),
          value: DiceRollType.COLDCARD,
          checked: this.diceRollType === DiceRollType.COLDCARD
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: async (result: DiceRollType) => {
            this.diceRollType = result
          }
        }
      ]
    })
    alert.present()
  }
}
