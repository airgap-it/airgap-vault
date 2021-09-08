import { Component } from '@angular/core'
import { Observable } from 'rxjs'

import { MnemonicSecret } from '../../models/secret'
import { SecretsService } from '../../services/secrets/secrets.service'

@Component({
  selector: 'airgap-current-secret',
  templateUrl: 'current-secret.component.html'
})
export class CurrentSecretComponent {
  public readonly secrets$: Observable<MnemonicSecret[]>
  public readonly currentSecret$: Observable<MnemonicSecret>

  constructor(private readonly secretsService: SecretsService) {
    this.secrets$ = this.secretsService.getSecretsObservable()
    this.currentSecret$ = this.secretsService.getActiveSecretObservable()
  }

  public onChange(newSecret: MnemonicSecret): void {
    this.secretsService.setActiveSecret(newSecret)
  }
}
