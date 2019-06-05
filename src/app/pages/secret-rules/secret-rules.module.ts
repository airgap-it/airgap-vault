import { TranslateModule } from '@ngx-translate/core'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

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
