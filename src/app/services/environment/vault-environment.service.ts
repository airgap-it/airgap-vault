import { BaseEnvironmentService, RuntimeMode } from '@airgap/angular-core'
import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class VaultEnvironmentService extends BaseEnvironmentService {
  constructor() {
    super(RuntimeMode.OFFLINE)
  }
}