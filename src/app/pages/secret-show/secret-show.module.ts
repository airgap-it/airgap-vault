import { TranslateModule } from '@ngx-translate/core'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'
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
