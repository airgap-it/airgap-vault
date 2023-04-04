import { IsolatedModule, UIResourceStatus } from '@airgap/angular-core'
import { Injectable } from '@angular/core'
import { Directory } from '@capacitor/filesystem'
import { ComponentStore, tapResponse } from '@ngrx/component-store'
import { from, Observable } from 'rxjs'
import { first, switchMap } from 'rxjs/operators'
import { IsolatedModuleDetails, IsolatedModulesListState } from './isolated-modules-list.types'

const initialState: IsolatedModulesListState = {
  modules: {
    status: UIResourceStatus.IDLE,
    value: []
  }
}

@Injectable()
export class IsolatedModulesListStore extends ComponentStore<IsolatedModulesListState> {
  constructor() {
    super(initialState)
  }

  public readonly onPageLoaded$ = this.effect((props$: Observable<void>) => {
    return props$.pipe(
      switchMap(() => from(this.loadModules()).pipe(first())),
      tapResponse(
        (value: IsolatedModuleDetails[]) => this.setModules(value),
        () => this.onError()
      )
    )
  })

  public readonly setModules = this.updater((state: IsolatedModulesListState, modules: IsolatedModuleDetails[]) => {
    return {
      ...state,
      modules: {
        status: UIResourceStatus.SUCCESS,
        value: modules
      }
    }
  })

  public readonly onError = this.updater((state: IsolatedModulesListState) => {
    return {
      ...state,
      modules: {
        status: UIResourceStatus.ERROR,
        value: state.modules.value
      }
    }
  })

  private async loadModules(): Promise<IsolatedModuleDetails[]> {
    // TODO: load from the file system
    return [{
      metadata: {
        module: {} as IsolatedModule,
        manifest: {
          name: '@airgap/aeternity',
          version: '0.13.10-beta.0',
          author: 'Papers AG',
          url: 'https://papers.ch',
          email: 'contact@papers.ch',
          repo: 'https://github.com/airgap-it/airgap-coin-lib',
          signature: '0xfa472f1e3bed6eb8e099d5ea11de095877ce178679148d592d9f853c30ecb23d',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
          src: {
            namespace: 'aeternity'
          },
          res: {
            symbol: 'file://ae.svg'
          },
          include: [
            'index.browserify.json',
            'ae.svg'
          ]
        },
        path: '/modules/aeternity.zip',
        root: '/',
        directory: Directory.External
      },
      installedAt: 1680620936168
    }]
  }
}