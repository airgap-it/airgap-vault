import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { SecretShowPage } from './secret-show.page'
// import { SecretValidatePageModule } from '../secret-validate/secret-validate.module'

const routes: Routes = [
  {
    path: '',
    component: SecretShowPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [SecretShowPage]
})
export class SecretShowPageModule {}
