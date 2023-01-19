import { UIResource, UIResourceStatus } from '@airgap/angular-core'
import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { isProtocolModuleMetadata, ProtocolModuleMetadata } from 'src/app/services/protocol-module/protocol-module.service'

import * as actions from './module-preview.actions'
import * as fromModulePreview from './module-preview.reducer'

@Component({
  selector: 'airgap-module-preview',
  templateUrl: './module-preview.page.html',
  styleUrls: ['./module-preview.page.scss']
})
export class ModulePreviewPage implements OnInit {
  public readonly moduleName: string | undefined

  public readonly moduleMetadata$: Observable<UIResource<ProtocolModuleMetadata>>

  public readonly UIResourceStatus: typeof UIResourceStatus = UIResourceStatus

  constructor(
    private readonly store: Store<fromModulePreview.State>,
    private readonly navigationService: NavigationService
  ) {
    const state = this.navigationService.getState()
    if (state.metadata && isProtocolModuleMetadata(state.metadata)) {
      this.moduleName = state.metadata.manifest.name
    }

    this.moduleMetadata$ = this.store.select(fromModulePreview.selectModuleMetadata)
  }

  public ngOnInit() {
    this.store.dispatch(actions.viewInitialization())
  }

  public install(metadata: ProtocolModuleMetadata) {
    this.store.dispatch(actions.installModule({ metadata }))
  }
}
