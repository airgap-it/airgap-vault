import { Component } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'airgap-wipe-confirm',
  templateUrl: './wipe-confirm.component.html',
  styleUrls: ['./wipe-confirm.component.scss']
})
export class WipeConfirmComponent {
  public hasBackup: boolean = false
  public acknowledgesLoss: boolean = false
  public typedPhrase: string = ''

  constructor(private readonly modalController: ModalController, private readonly translateService: TranslateService) {}

  public get confirmationPhrase(): string {
    return this.translateService.instant('danger-zone.wipe.confirm.phrase')
  }

  public get canWipe(): boolean {
    return this.hasBackup && this.acknowledgesLoss && this.normalize(this.typedPhrase) === this.normalize(this.confirmationPhrase)
  }

  public async cancel(): Promise<void> {
    await this.modalController.dismiss(undefined, 'cancel')
  }

  public async confirm(): Promise<void> {
    if (!this.canWipe) {
      return
    }

    await this.modalController.dismiss(undefined, 'confirm')
  }

  private normalize(value: string): string {
    return (value ?? '').trim().toLowerCase()
  }
}
