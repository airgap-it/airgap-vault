import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { SecretRulesPage } from './secret-rules'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [SecretRulesPage],
  imports: [IonicPageModule.forChild(SecretRulesPage), TranslateModule],
  entryComponents: [SecretRulesPage]
})
export class SecretRulesPageModule {}
