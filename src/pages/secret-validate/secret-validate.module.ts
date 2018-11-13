import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { SecretValidatePage } from './secret-validate'
import { ComponentsModule } from '../../components/components.module'

@NgModule({
  declarations: [SecretValidatePage],
  imports: [ComponentsModule, IonicPageModule.forChild(SecretValidatePage)],
  entryComponents: [SecretValidatePage]
})
export class SecretValidatePageModule {}
