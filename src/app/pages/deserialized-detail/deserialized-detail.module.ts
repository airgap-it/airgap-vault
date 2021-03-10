import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { TranslateModule } from '@ngx-translate/core'

import { ComponentsModule } from '../../components/components.module'

import { DeserializedDetailEffects } from './deserialized-detail.effects'
import { DeserializedDetailPage } from './deserialized-detail.page'
import * as fromDeserializedDetail from './deserialized-detail.reducer'

const routes: Routes = [
  {
    path: '',
    component: DeserializedDetailPage
  }
]

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    StoreModule.forFeature('deserializedDetail', fromDeserializedDetail.reducer),
    EffectsModule.forFeature([DeserializedDetailEffects])
  ],
  declarations: [DeserializedDetailPage]
})
export class DeserializedDetailPageModule {}
