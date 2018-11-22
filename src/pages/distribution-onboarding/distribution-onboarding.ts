import { Component, ViewChild } from '@angular/core'
import { IonicPage, ViewController, Slides } from 'ionic-angular'
import { Storage } from '@ionic/storage'

@IonicPage()
@Component({
  selector: 'page-distribution-onboarding',
  templateUrl: 'distribution-onboarding.html'
})
export class DistributionOnboardingPage {
  @ViewChild(Slides) slides: Slides

  constructor(private viewController: ViewController, private storage: Storage) {}

  async next() {
    this.slides.slideNext()
  }

  async accept() {
    await this.storage.set('DISCLAIMER_ELECTRON', true)
    this.viewController.dismiss()
  }
}
