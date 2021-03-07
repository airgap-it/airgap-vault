import { Component, OnInit, ViewChild } from '@angular/core'
import { IonContent } from '@ionic/angular'
import { Secret } from 'src/app/models/secret'
import { DiceRollService } from 'src/app/services/dice-roll/dice-roll.service'
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

  private entropy: string = ''

  constructor(private readonly navigationService: NavigationService, private readonly diceRollService: DiceRollService) {}

  ngOnInit() {}

  async next() {
    const entropy = await this.diceRollService.getEntropyFromInput(this.entropy)

    const secret: Secret = new Secret(entropy)

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

  scrollToBottom() {
    this.content.scrollToBottom(500)
  }
}
