import { Location } from '@angular/common'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

import { Identifiable } from '../../models/identifiable'

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private state: any

  constructor(private readonly router: Router, private readonly location: Location) {}

  public async routeWithIdentifiableObject(router: Router, route: string, object: Identifiable): Promise<boolean> {
    return router.navigate([route, object.getIdentifier()])
  }

  public route(route: string): Promise<boolean> {
    return this.router.navigateByUrl(route)
  }

  public async routeWithState(route: string, object: any): Promise<boolean> {
    this.state = object

    return this.router.navigateByUrl(route)
  }

  public back(): void {
    this.location.back()
  }

  public getState(): any {
    return this.state
  }
}
