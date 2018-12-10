import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { SecretValidatePage } from './secret-validate'
import { ComponentsModule } from '../../components/components.module'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [SecretValidatePage],
  imports: [ComponentsModule, IonicPageModule.forChild(SecretValidatePage), TranslateModule],
  entryComponents: [SecretValidatePage]
})
export class SecretValidatePageModule {}
