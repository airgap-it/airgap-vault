import { Component, OnInit, ViewChild } from '@angular/core'
import { IonContent } from '@ionic/angular'
import { MnemonicSecret } from 'src/app/models/secret'
import { CoinFlipService } from 'src/app/services/coin-flip/coin-flip.service'
import { ErrorCategory, handleErrorLocal } from 'src/app/services/error-handler/error-handler.service'
import { NavigationService } from 'src/app/services/navigation/navigation.service'

@Component({
  selector: 'airgap-secret-generate-coin-flip',
  templateUrl: './secret-generate-coin-flip.page.html',
  styleUrls: ['./secret-generate-coin-flip.page.scss']
})
export class SecretGenerateCoinFlipPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content: IonContent

  public isValid: boolean = false

  public minLength: number = 256
  public maxLength: number = 256

  public error: string = ''

  private entropy: string = ''

  constructor(private readonly navigationService: NavigationService, private readonly coinFlipService: CoinFlipService) {}

  ngOnInit() {}

  async next() {
    const entropy = await this.coinFlipService.getEntropyFromInput(this.entropy)

    const secret: MnemonicSecret = new MnemonicSecret(entropy)

    this.navigationService.routeWithState('secret-rules', { secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }

  async updateEntropy(input: string) {
    this.entropy = input
    this.validateEntropy()
  }

  async validateEntropy() {
    if (this.entropy.length !== 256) {
      this.isValid = false
      this.error = ''
      return
    }

    try {
      this.isValid = await this.coinFlipService.validateInput(this.entropy)
    } catch (e) {
      this.isValid = false
      this.error = e
    }
  }

  scrollToBottom() {
    this.content.scrollToBottom(500)
  }
}
