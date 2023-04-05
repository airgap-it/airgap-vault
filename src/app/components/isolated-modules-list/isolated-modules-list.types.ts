import { IsolatedModuleInstalledMetadata, UIResource } from '@airgap/angular-core'

export interface IsolatedModulesListState {
  allModules: UIResource<IsolatedModuleInstalledMetadata[]>
  filteredModules: UIResource<IsolatedModuleInstalledMetadata[]>
}
