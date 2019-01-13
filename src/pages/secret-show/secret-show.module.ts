import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { SecretShowPage } from './secret-show'
import { SecretValidatePageModule } from '../secret-validate/secret-validate.module'
import { TranslateModule } from '@ngx-translate/core'
import { ComponentsModule } from '../../components/components.module'

@NgModule({
  declarations: [SecretShowPage],
  imports: [ComponentsModule, SecretValidatePageModule, IonicPageModule.forChild(SecretShowPage), TranslateModule],
  entryComponents: [SecretShowPage]
})
export class SecretShowPageModule {}
