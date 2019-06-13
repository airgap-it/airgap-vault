import { Component } from '@angular/core'
import { Observable } from 'rxjs'

import { Secret } from '../../models/secret'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'airgap-current-secret',
  templateUrl: 'current-secret.component.html'
})
export class CurrentSecretComponent {
  public readonly secrets$: Observable<Secret[]>
  public readonly currentSecret$: Observable<Secret>

  constructor(private readonly secretsProvider: SecretsService) {
    this.secrets$ = this.secretsProvider.getSecretsObservable()
    this.currentSecret$ = this.secretsProvider.getActiveSecretObservable()
  }

  public onChange(newSecret: Secret): void {
    this.secretsProvider.setActiveSecret(newSecret)
  }
}
