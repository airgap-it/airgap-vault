import { ComponentsModule } from './../../components/components.module'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { IonicModule } from '@ionic/angular'

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
