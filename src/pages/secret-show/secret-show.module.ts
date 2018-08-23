import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { SecretShowPage } from './secret-show'
import { SecretValidatePageModule } from '../secret-validate/secret-validate.module'

@NgModule({
  declarations: [
    SecretShowPage
  ],
  imports: [
    SecretValidatePageModule,
    IonicPageModule.forChild(SecretShowPage)
  ],
  entryComponents: [
    SecretShowPage
  ]
})
export class SecretShowPageModule {}
