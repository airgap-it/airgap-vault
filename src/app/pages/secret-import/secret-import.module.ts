import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { MnemonicKeyboardComponent } from 'src/app/components/mnemonic-keyboard/mnemonic-keyboard.component'

import { SecretImportPage } from './secret-import.page'

const routes: Routes = [
  {
    path: '',
    component: SecretImportPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [SecretImportPage, MnemonicKeyboardComponent]
})
export class SecretImportPageModule {}
