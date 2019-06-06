import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { ComponentsModule } from './../../components/components.module'
import { SecretGeneratePage } from './secret-generate.page'

const routes: Routes = [
  {
    path: '',
    component: SecretGeneratePage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule, ComponentsModule],
  declarations: [SecretGeneratePage]
})
export class SecretGeneratePageModule {}
