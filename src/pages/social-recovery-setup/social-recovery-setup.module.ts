import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { SocialRecoverySetupPage } from './social-recovery-setup'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [SocialRecoverySetupPage],
  imports: [IonicPageModule.forChild(SocialRecoverySetupPage), TranslateModule],
  entryComponents: [SocialRecoverySetupPage]
})
export class SocialRecoverySetupPageModule {}
