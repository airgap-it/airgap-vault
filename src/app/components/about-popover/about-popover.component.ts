import { Component } from '@angular/core'
import { AppVersion } from '@ionic-native/app-version/ngx'

@Component({
  template: `
    <ion-list no-lines no-detail>
      <ion-list-header>{{ 'about-popover.label' | translate }}</ion-list-header>
      <ion-item>{{ 'about-popover.version' | translate }} {{ versionNumber }}</ion-item>
      <ion-item>{{ 'about-popover.code' | translate }} {{ versionCode }}</ion-item>
    </ion-list>
  `
})
export class AboutPopoverComponent {
  public versionCode: string
  public versionNumber: string

  constructor(private readonly appVersion: AppVersion) {}

  public async ngOnInit() {
    this.versionNumber = await this.appVersion.getVersionNumber()
    this.versionCode = `${await this.appVersion.getVersionCode()}`
  }
}
