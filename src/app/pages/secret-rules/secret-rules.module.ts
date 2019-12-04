import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { SecretRulesPage } from './secret-rules.page'

const routes: Routes = [
  {
    path: '',
    component: SecretRulesPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, TranslateModule, RouterModule.forChild(routes)],
  declarations: [SecretRulesPage]
})
export class SecretRulesPageModule {}
