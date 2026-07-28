import { Component } from '@angular/core'
import { MnemonicSecret } from '../../models/secret'
import { NavigationService } from '../../services/navigation/navigation.service'


@Component({
  selector: 'app-secret-seedqr-template',
  templateUrl: './secret-seedqr-template.page.html'  
})
export class SecretSeedqrTemplatePage {


  public readonly secret: MnemonicSecret
  public format: 'standard' | 'compact' = 'standard'
  public wordCount: number = 0
  public selectedTemplate: string = ''
  public selectedModules: number = 0
  public seedQrData: string = ''
  public qrImage: string = ''

  constructor(
  private readonly navigationService: NavigationService
) {

  const state = this.navigationService.getState()

  this.secret = state.secret
  this.format = state.format || 'standard'
  this.wordCount = state.wordCount
  this.seedQrData = state.seedQrData
  this.qrImage = state.qrImage

  this.calculateTemplate()

}

private calculateTemplate(): void {

  if (this.format === 'standard') {

    this.selectedModules = this.wordCount === 12 ? 25 : 29

  } else {

    this.selectedModules = this.wordCount === 12 ? 21 : 25

  }

  this.selectedTemplate =
    `${this.format === 'standard' ? 'Standard' : 'Compact'} SeedQR - ${this.selectedModules}x${this.selectedModules}`

}

public continueTemplate(): void {

  this.navigationService.routeWithState(
    '/secret-seedqr-template-view',
    {
      secret: this.secret,
      format: this.format,
      numModules: this.selectedModules,
      wordCount: this.wordCount,
      seedQrData: this.seedQrData,
      qrImage: this.qrImage,
    }
  )

}
}