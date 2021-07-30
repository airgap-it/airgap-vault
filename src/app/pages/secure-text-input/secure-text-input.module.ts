import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { SecureTextInputPageRoutingModule } from './secure-text-input-routing.module'

import { SecureKeyboardComponent } from 'src/app/components/secure-keyboard/secure-keyboard.component'

import { SecureTextInputPage } from './secure-text-input.page'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SecureTextInputPageRoutingModule],
  declarations: [SecureTextInputPage, SecureKeyboardComponent]
})
export class SecureTextInputPageModule {}
