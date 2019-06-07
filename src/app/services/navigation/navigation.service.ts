import { Injectable } from '@angular/core'
import { Router } from '@angular/router'

import { Identifiable } from '../../models/identifiable'

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private state: any

  constructor(private readonly router: Router) {}

  public async route(router: Router, route: string, object: Identifiable): Promise<boolean> {
    return router.navigate([route, object.getIdentifier()])
  }

  public async routeWithState(route: string, object: any): Promise<boolean> {
    this.state = object

    return this.router.navigateByUrl(route)
  }

  public getState(): any {
    return this.state
  }
}
