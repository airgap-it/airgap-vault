import { ComponentsModule } from './../../components/components.module'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
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
