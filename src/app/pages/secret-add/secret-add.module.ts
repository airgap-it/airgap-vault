import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { ComponentsModule } from 'src/app/components/components.module'

import { SecretAddPage } from './secret-add.page'
const routes: Routes = [
  {
    path: '',
    component: SecretAddPage
  }
]

@NgModule({
  entryComponents: [],
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule, ComponentsModule],
  declarations: [SecretAddPage]
})
export class SecretAddPageModule {}
