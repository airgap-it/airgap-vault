import { Component } from '@angular/core'
import { AppVersion } from '@ionic-native/app-version/ngx'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'

@Component({
  selector: 'airgap-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss']
})
export class AboutPage {
  public appName: string = 'APP_NAME'
  public packageName: string = 'PACKAGE_NAME'
  public versionNumber: string = 'VERSION_NUMBER'
  public versionCode: string | number = 'VERSION_CODE'

  constructor(private readonly appVersion: AppVersion) {
    this.updateVersions().catch(handleErrorLocal(ErrorCategory.CORDOVA_PLUGIN))
  }

  public async updateVersions(): Promise<void> {
    this.appName = await this.appVersion.getAppName()
    this.packageName = await this.appVersion.getPackageName()
    this.versionNumber = await this.appVersion.getVersionNumber()
    this.versionCode = String(await this.appVersion.getVersionCode())
  }
}
