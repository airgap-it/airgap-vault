import { Location } from '@angular/common'
import { Injectable } from '@angular/core'
import { NavigationBehaviorOptions, Router } from '@angular/router'
import { NavController } from '@ionic/angular'
import { App } from '@capacitor/app'

import { Identifiable } from '../../models/identifiable'

interface State {
  // tslint:disable-next-line: no-any
  [key: string]: any
}

const rootPath: string = '/tabs/tab-secrets'
const settingsPath: string = '/tabs/tab-settings'
const scanPath: string = '/tabs/tab-scan'

const paths: { path: string; prevPath: string }[] = [
  { path: settingsPath, prevPath: rootPath },
  { path: '/about', prevPath: settingsPath },
  { path: '/qr-settings', prevPath: settingsPath },
  { path: '/languages-selection-settings', prevPath: settingsPath },
  { path: '/wordlist', prevPath: settingsPath },
  { path: '/error-history', prevPath: settingsPath },
  { path: '/contact-book-onboarding', prevPath: settingsPath },
  { path: '/contact-book-contacts', prevPath: settingsPath },
  { path: '/contact-book-contacts-detail', prevPath: '/contact-book-contacts' },
  { path: scanPath, prevPath: rootPath },
  { path: '/accounts-list', prevPath: rootPath },
  { path: '/account-address', prevPath: '/accounts-list' },
  { path: '/secret-setup', prevPath: rootPath },
  { path: '/contact-book-scan', prevPath: '/contact-book-contacts-detail' }
]

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private state: State | undefined = {}

  constructor(private readonly router: Router, private readonly location: Location, private readonly navCtrl: NavController) {}

  public async routeWithIdentifiableObject(router: Router, route: string, object: Identifiable): Promise<boolean> {
    return router.navigate([route, object.getIdentifier()])
  }

  public route(route: string, clearStack: boolean = false): Promise<boolean> {
    return this.router.navigateByUrl(route, { replaceUrl: clearStack })
  }

  public async routeWithState(route: string, object: State, options?: NavigationBehaviorOptions): Promise<boolean> {
    this.state = object

    return this.router.navigateByUrl(route, options)
  }

  public back(): void {
    this.location.back()
  }

  public routeBack(route: string): void {
    this.navCtrl.navigateBack(route)
  }

  public getState(): State {
    return this.state
  }

  public resetState(): void {
    this.state = {}
  }

  public routeToSecretsTab(clearStack: boolean = false): Promise<boolean> {
    return this.router.navigateByUrl(rootPath, { replaceUrl: clearStack })
  }

  public routeToScanTab(clearStack: boolean = false): Promise<boolean> {
    return this.router.navigateByUrl(scanPath, { replaceUrl: clearStack })
  }

  public routeToSettingsTab(clearStack: boolean = false): Promise<boolean> {
    return this.router.navigateByUrl(settingsPath, { replaceUrl: clearStack })
  }

  handleAndroidBackNavigation(currentPath: string) {
    if (currentPath === rootPath) {
      App.exitApp()
      return
    }

    const prevpath = paths.find((p) => currentPath.includes(p.path))
    if (prevpath) {
      this.router.navigateByUrl(prevpath.prevPath).catch((error) => console.error('error related to navigation', error))
    }
  }
}
