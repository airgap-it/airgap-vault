import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { SecretImportPage } from './secret-import'

@NgModule({
  declarations: [SecretImportPage],
  imports: [IonicPageModule.forChild(SecretImportPage)],
  entryComponents: [SecretImportPage]
})
export class SecretImportPageModule {}
