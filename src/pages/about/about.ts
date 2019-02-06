import { Component } from '@angular/core'
import { AppVersion } from '@ionic-native/app-version'
import { NavController, NavParams } from 'ionic-angular'

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
    this.updateVersions()
  }

  async updateVersions() {
    this.appName = await this.app.getAppName()
    this.packageName = await this.app.getPackageName()
    this.versionNumber = await this.app.getVersionNumber()
    this.versionCode = await String(this.app.getVersionCode())
  }
}
