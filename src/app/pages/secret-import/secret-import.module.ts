import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { SecretImportPage } from './secret-import.page'
import { ComponentsModule } from '../../components/components.module'

const routes: Routes = [
  {
    path: '',
    component: SecretImportPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, ComponentsModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [SecretImportPage]
})
export class SecretImportPageModule {}
