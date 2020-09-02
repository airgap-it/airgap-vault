import { CanActivate, ActivatedRouteSnapshot } from '@angular/router'
import { Injectable } from '@angular/core'
import { NavigationService } from '../navigation/navigation.service'
import { SecretsService } from '../secrets/secrets.service'

@Injectable()
export class ProtocolandKeyGuard implements CanActivate {
  constructor(private navigationService: NavigationService, private readonly secretsService: SecretsService) {}
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const protocol: string = route.params.protocol
    const publicKey: string = route.params.publicKey

    if (this.secretsService.findWalletByPublicKeyAndProtocolIdentifier(publicKey, protocol) === undefined) {
      alert('The wallet you are trying to access does not exist.')
      this.navigationService.route('/')
    }

    return this.secretsService.findWalletByPublicKeyAndProtocolIdentifier(publicKey, protocol) !== undefined
  }
}
