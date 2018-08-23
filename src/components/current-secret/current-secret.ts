import { Component, Output, EventEmitter, Input } from '@angular/core'
import { SecretsProvider } from '../../providers/secrets/secrets.provider'
import { Secret } from '../../models/secret'

/**
 * Generated class for the CurrentSecretComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
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
    this.secrets = this.secretsProvider.currentSecretsList.getValue()
    this.currentSecret = this.secrets.indexOf(this.secretsProvider.getActiveSecret())
  }

  @Input() set chosenSecret(secret: Secret) {
    this.currentSecret = this.secrets.indexOf(secret)
  }

  onChange(newSecret) {
    this.secretsProvider.setActiveSecret(this.secrets[newSecret])
    this.secretChanged.emit(this.secrets[newSecret])
  }

}
