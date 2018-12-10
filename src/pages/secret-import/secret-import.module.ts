import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { SecretImportPage } from './secret-import'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [SecretImportPage],
  imports: [IonicPageModule.forChild(SecretImportPage), TranslateModule],
  entryComponents: [SecretImportPage]
})
export class SecretImportPageModule {}
