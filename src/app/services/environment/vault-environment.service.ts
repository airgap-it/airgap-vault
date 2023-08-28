import { BaseEnvironmentService, RuntimeMode } from '@airgap/angular-core'
import { Inject, Injectable } from '@angular/core'
import { Platform } from '@ionic/angular'
import { BehaviorSubject, Observable } from 'rxjs'
import { EnvironmentPlugin } from 'src/app/capacitor-plugins/definitions'
import { ENVIRONMENT_PLUGIN } from 'src/app/capacitor-plugins/injection-tokens'

export type VaultEnvironmentContext = 'empty' | 'knox'

@Injectable({
  providedIn: 'root'
})
export class VaultEnvironmentService extends BaseEnvironmentService {
  private readonly context$: BehaviorSubject<VaultEnvironmentContext> = new BehaviorSubject<VaultEnvironmentContext>('empty')

  constructor(
    @Inject(ENVIRONMENT_PLUGIN) private readonly environment: EnvironmentPlugin,
    private readonly platform: Platform
  ) {
    super(RuntimeMode.OFFLINE)

    if (this.platform.is('hybrid')) {
      this.environment.addListener('envContextChanged', ({ context }) => {
        this.context$.next(context)
      })
    }
  }

  public getContextObservable(): Observable<VaultEnvironmentContext> {
    return this.context$.asObservable()
  }
}