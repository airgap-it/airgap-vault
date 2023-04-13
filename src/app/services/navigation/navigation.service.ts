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

const paths: { path: string; prevPath: string }[] = [{ path: '/tabs/tab-settings', prevPath: rootPath }]

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private state: State | undefined = {}

  constructor(private readonly router: Router, private readonly location: Location, private readonly navCtrl: NavController) {}

  public async routeWithIdentifiableObject(router: Router, route: string, object: Identifiable): Promise<boolean> {
    return router.navigate([route, object.getIdentifier()])
  }

  public route(route: string): Promise<boolean> {
    return this.router.navigateByUrl(route)
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

  public routeToSecretsTab(clearStack: boolean = false): Promise<boolean> {
    return this.router.navigateByUrl('/tabs/tab-secrets', { replaceUrl: clearStack })
  }

  public routeToScanTab(clearStack: boolean = false): Promise<boolean> {
    return this.router.navigateByUrl('/tabs/tab-scan', { replaceUrl: clearStack })
  }

  public routeToSettingsTab(clearStack: boolean = false): Promise<boolean> {
    return this.router.navigateByUrl('/tabs/tab-settings', { replaceUrl: clearStack })
  }

  handleBackNavigation(currentPath: string) {
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
