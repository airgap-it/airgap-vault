import { Component } from '@angular/core'
import { IonTabs } from '@ionic/angular'

@Component({
  selector: 'airgap-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  private activeTab?: HTMLElement

  constructor() {}

  tabChange(tabsRef: IonTabs) {
    this.activeTab = tabsRef.outlet.activatedView.element
  }

  ionViewWillEnter() {
    this.propagateToActiveTab('ionViewWillEnter')
  }

  private propagateToActiveTab(eventName: string) {
    if (this.activeTab) {
      this.activeTab.dispatchEvent(new CustomEvent(eventName))
    }
  }
}
