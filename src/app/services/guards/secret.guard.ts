import { CanActivate, ActivatedRouteSnapshot } from '@angular/router'
import { Injectable } from '@angular/core'
import { NavigationService } from '../navigation/navigation.service'
import { SecretsService } from '../secrets/secrets.service'

@Injectable()
export class SecretGuard implements CanActivate {
  constructor(private navigationService: NavigationService, private readonly secretsService: SecretsService) {}
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const secretID = route.params.secretID
    const flow = route.params.flow

    if (flow === 'generate') {
      return true
    }
    if (this.secretsService.getSecretById(secretID) === undefined) {
      alert('The secret you are trying to access does not exist.')
      this.navigationService.route('/')
    }
    return this.secretsService.getSecretById(secretID) !== undefined
  }
}
