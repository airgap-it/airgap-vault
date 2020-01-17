import { Component } from '@angular/core'
import { Plugins } from '@capacitor/core'

import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'

const { AppInfo } = Plugins

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

  constructor() {
    this.updateVersions().catch(handleErrorLocal(ErrorCategory.CORDOVA_PLUGIN))
  }

  public async updateVersions(): Promise<void> {
    const appInfo = await AppInfo.get()
    
    this.appName = appInfo.appName
    this.packageName = appInfo.packageName
    this.versionName = appInfo.versionName
    this.versionCode = String(appInfo.versionCode)
  }
}
