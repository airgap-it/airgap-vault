import { SecretsService } from './../../services/secrets/secrets.service'
import { Component, Output, EventEmitter, Input } from '@angular/core'
import { Secret } from '../../models/secret'

@Component({
  selector: 'app-current-secret',
  templateUrl: 'app-current-secret.html'
})
export class CurrentSecretComponent {
  private secrets: Secret[] = []
  private currentSecret = 0

  @Output('secretChanged')
  secretChanged = new EventEmitter<Secret>()

  constructor(private secretsProvider: SecretsService) {
    this.secrets = this.secretsProvider.currentSecretsList.getValue()
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
