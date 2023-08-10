import { BaseEnvironmentService, RuntimeMode } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import { Platform } from '@ionic/angular'

@Injectable({
  providedIn: 'root'
})
export class VaultEnvironmentService extends BaseEnvironmentService {
  constructor(private readonly platform: Platform) {
    super(RuntimeMode.OFFLINE)
  }
}