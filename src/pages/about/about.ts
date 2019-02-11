import { Component } from '@angular/core'
import { AppVersion } from '@ionic-native/app-version'
import { NavController, NavParams } from 'ionic-angular'
import { handleErrorLocal, ErrorCategory } from '../../providers/error-handler/error-handler'

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  public appName = ''
  public packageName = ''
  public versionNumber = ''
  public versionCode = ''

  constructor(public navCtrl: NavController, public navParams: NavParams, private app: AppVersion) {
    this.updateVersions().catch(handleErrorLocal(ErrorCategory.CORDOVA_PLUGIN))
  }

  async updateVersions() {
    this.appName = await this.app.getAppName()
    this.packageName = await this.app.getPackageName()
    this.versionNumber = await this.app.getVersionNumber()
    this.versionCode = String(await this.app.getVersionCode())
  }
}
