import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { SocialRecoveryImportPage } from './social-recovery-import'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [SocialRecoveryImportPage],
  imports: [IonicPageModule.forChild(SocialRecoveryImportPage), TranslateModule],
  entryComponents: [SocialRecoveryImportPage]
})
export class SocialRecoveryImportPageModule {}
