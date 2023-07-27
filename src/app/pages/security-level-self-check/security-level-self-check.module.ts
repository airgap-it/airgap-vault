import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { SecurityLevelSelfCheckPage } from './security-level-self-check.page'

const routes: Routes = [
  {
    path: '',
    component: SecurityLevelSelfCheckPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [SecurityLevelSelfCheckPage]
})
export class SecurityLevelSelfCheckPageModule {}
