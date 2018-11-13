import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { SocialRecoverySetupPage } from './social-recovery-setup'

@NgModule({
  declarations: [SocialRecoverySetupPage],
  imports: [IonicPageModule.forChild(SocialRecoverySetupPage)],
  entryComponents: [SocialRecoverySetupPage]
})
export class SocialRecoverySetupPageModule {}
