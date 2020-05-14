import { Component, Inject } from '@angular/core'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { AppInfoPlugin } from 'src/app/capacitor-plugins/definitions'
import { APP_INFO_PLUGIN } from 'src/app/capacitor-plugins/injection-tokens'

@Component({
  selector: 'airgap-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss']
})
export class AboutPage {
  public appName: string = 'APP_NAME'
  public packageName: string = 'PACKAGE_NAME'
  public versionName: string = 'VERSION_NUMBER'
  public versionCode: string | number = 'VERSION_CODE'

  constructor(@Inject(APP_INFO_PLUGIN) private readonly appInfo: AppInfoPlugin) {
    this.updateVersions().catch(handleErrorLocal(ErrorCategory.CORDOVA_PLUGIN))
  }

  public async updateVersions(): Promise<void> {
    const appInfo = await this.appInfo.get()

    this.appName = appInfo.appName
    this.packageName = appInfo.packageName
    this.versionName = appInfo.versionName
    this.versionCode = appInfo.versionCode
  }
}
