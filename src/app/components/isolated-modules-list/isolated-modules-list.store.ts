import { IsolatedModuleInstalledMetadata, UIResourceStatus } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import { ComponentStore, tapResponse } from '@ngrx/component-store'
import { from, Observable } from 'rxjs'
import { first, switchMap } from 'rxjs/operators'
import { VaultModulesService } from 'src/app/services/modules/modules.service'
import { IsolatedModulesListState } from './isolated-modules-list.types'

const initialState: IsolatedModulesListState = {
  allModules: {
    status: UIResourceStatus.IDLE,
    value: []
  },
  filteredModules: {
    status: UIResourceStatus.IDLE,
    value: []
  }
}

@Injectable()
export class IsolatedModulesListStore extends ComponentStore<IsolatedModulesListState> {
  constructor(private readonly modulesService: VaultModulesService) {
    super(initialState)
  }

  public readonly onPageLoaded$ = this.effect((query$: Observable<string | undefined>) => {
    return query$.pipe(
      switchMap((query: string | undefined) => from(this.loadModules()).pipe(
        first(),
        tapResponse(
          (value: IsolatedModuleInstalledMetadata[]) => this.setModules({modules: value, query }),
          () => this.onError()
        )
      ))
    )
  })

  public readonly setModules = this.updater((state: IsolatedModulesListState, data: { modules: IsolatedModuleInstalledMetadata[], query?: string }) => {
    return {
      ...state,
      allModules: {
        status: UIResourceStatus.SUCCESS,
        value: data.modules
      },
      filteredModules: {
        status: UIResourceStatus.SUCCESS,
        value: this.filterModulesByNameOrAuthor(data.modules, data.query)
      }
    }
  })

  public readonly filterModules = this.updater((state: IsolatedModulesListState, query: string | undefined) => {
    return {
      ...state,
      filteredModules: {
        status: state.allModules.status,
        value: this.filterModulesByNameOrAuthor(state.allModules.value ?? [], query)
      }
    }
  })

  public readonly onError = this.updater((state: IsolatedModulesListState) => {
    return {
      ...state,
      allModules: {
        status: UIResourceStatus.ERROR,
        value: state.allModules.value
      },
      filteredModules: {
        status: UIResourceStatus.ERROR,
        value: state.filteredModules.value
      }
    }
  })

  private async loadModules(): Promise<IsolatedModuleInstalledMetadata[]> {
    return this.modulesService.getModulesMetadata()
  }

  private filterModulesByNameOrAuthor(modules: IsolatedModuleInstalledMetadata[], query: string | undefined): IsolatedModuleInstalledMetadata[] {
    return query
    ? modules.filter((module: IsolatedModuleInstalledMetadata) => {
      return module.manifest.name.toLowerCase().includes(query.toLowerCase()) || module.manifest.author.toLowerCase().includes(query.toLowerCase())
    })
    : modules
  }
}