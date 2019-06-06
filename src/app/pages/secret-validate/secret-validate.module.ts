import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { ComponentsModule } from './../../components/components.module'
import { SecretValidatePage } from './secret-validate.page'

const routes: Routes = [
  {
    path: '',
    component: SecretValidatePage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule, ComponentsModule],
  declarations: [SecretValidatePage]
})
export class SecretValidatePageModule {}
