import { Component, Output, EventEmitter, Input } from '@angular/core'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { Secret } from '../../models/secret'

@Component({
  selector: 'current-secret',
  templateUrl: 'current-secret.html'
})
export class CurrentSecretComponent {
  private secrets: Secret[] = []
  private currentSecret = 0

  @Output('secretChanged')
  secretChanged = new EventEmitter<Secret>()

  constructor(private secretsProvider: SecretsProvider) {
    this.secrets = this.secretsProvider.currentSecretsList.getValue().filter(secret => secret.secretType === 0) // TODO is this the cleanest solution?
    this.currentSecret = this.secrets.indexOf(this.secretsProvider.getActiveSecret())
  }

  @Input()
  set chosenSecret(secret: Secret) {
    this.currentSecret = this.secrets.indexOf(secret)
  }

  onChange(newSecret) {
    this.secretsProvider.setActiveSecret(this.secrets[newSecret])
    this.secretChanged.emit(this.secrets[newSecret])
  }
}
