import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { ComponentsModule } from 'src/app/components/components.module'

import { SecretEditPopoverComponent } from './secret-edit-popover/secret-edit-popover.component'
import { SecretEditPage } from './secret-edit.page'
const routes: Routes = [
  {
    path: '',
    component: SecretEditPage
  }
]

@NgModule({
  entryComponents: [SecretEditPopoverComponent],
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule, ComponentsModule],
  declarations: [SecretEditPage, SecretEditPopoverComponent]
})
export class SecretEditPageModule {}
