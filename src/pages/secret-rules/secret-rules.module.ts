import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { SecretRulesPage } from './secret-rules'

@NgModule({
  declarations: [
    SecretRulesPage
  ],
  imports: [
    IonicPageModule.forChild(SecretRulesPage)
  ],
  entryComponents: [
    SecretRulesPage
  ]
})
export class SecretRulesPageModule {}
