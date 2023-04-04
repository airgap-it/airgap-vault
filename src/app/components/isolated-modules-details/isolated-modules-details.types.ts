import { IsolatedModuleManifest, UIResource } from '@airgap/angular-core'

export interface IsolatedModulesDetailsState {
  manifest: UIResource<IsolatedModuleManifest>
  path: UIResource<string>
}