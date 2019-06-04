import { Component, EventEmitter, Input, Output } from '@angular/core'

import { Secret } from '../../models/secret'

import { SecretsService } from './../../services/secrets/secrets.service'

@Component({
  selector: 'current-secret',
  templateUrl: 'current-secret.component.html'
})
export class CurrentSecretComponent {
  private readonly secrets: Secret[] = []
  private currentSecret = 0

  @Output('secretChanged')
  public secretChanged = new EventEmitter<Secret>()

  constructor(private readonly secretsProvider: SecretsService) {
    this.secrets = this.secretsProvider.currentSecretsList.getValue()
    this.currentSecret = this.secrets.indexOf(this.secretsProvider.getActiveSecret())
  }

  @Input()
  set chosenSecret(secret: Secret) {
    this.currentSecret = this.secrets.indexOf(secret)
  }

  public onChange(newSecret) {
    this.secretsProvider.setActiveSecret(this.secrets[newSecret])
    this.secretChanged.emit(this.secrets[newSecret])
  }
}
