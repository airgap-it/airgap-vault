import { IsolatedModuleMetadata, UIResourceStatus } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import { ComponentStore } from '@ngrx/component-store'
import { IsolatedModulesDetailsState } from './isolated-modules-details.types'

const initialStore: IsolatedModulesDetailsState = {
  manifest: {
    status: UIResourceStatus.IDLE,
    value: undefined
  },
  path: {
    status: UIResourceStatus.IDLE,
    value: undefined
  }
}

@Injectable()
export class IsolatedModulesDetailsStore extends ComponentStore<IsolatedModulesDetailsState> {
  constructor() {
    super(initialStore)
  }

  public readonly setData = this.updater((state: IsolatedModulesDetailsState, metadata: IsolatedModuleMetadata) => {
    return {
      ...state,
      manifest: {
        status: UIResourceStatus.SUCCESS,
        value: metadata.manifest
      }
    }
  })
}