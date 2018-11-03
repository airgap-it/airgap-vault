import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { SignMessageRequestPage } from './sign-message-request'
import { QRCodeModule } from 'angularx-qrcode'

@NgModule({
  declarations: [SignMessageRequestPage],
  imports: [QRCodeModule, IonicPageModule.forChild(SignMessageRequestPage)]
})
export class SignMessageRequestPageModule {}
