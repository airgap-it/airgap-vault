import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { InteractionSelectionPage } from './interaction-selection.page'

const routes: Routes = [
  {
    path: '',
    component: InteractionSelectionPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [InteractionSelectionPage]
})
export class InteractionSelectionPageModule {}
