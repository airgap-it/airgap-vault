import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { ModulePreviewPageRoutingModule } from './module-preview-routing.module'

import { ModulePreviewPage } from './module-preview.page'
import { TranslateModule } from '@ngx-translate/core'
import { StoreModule } from '@ngrx/store'

import * as fromModulePreview from './module-preview.reducer'
import { EffectsModule } from '@ngrx/effects'
import { ModulePreviewEffects } from './module-preview.effects'
import { AirGapAngularCoreModule } from '@airgap/angular-core'

@NgModule({
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule, 
    ModulePreviewPageRoutingModule,
    TranslateModule,
    StoreModule.forFeature('modulePreview', fromModulePreview.reducer),
    EffectsModule.forFeature([ModulePreviewEffects]),
    AirGapAngularCoreModule
  ],
  declarations: [ModulePreviewPage]
})
export class ModulePreviewPageModule {}
