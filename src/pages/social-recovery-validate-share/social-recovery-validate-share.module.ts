import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { SocialRecoveryValidateSharePage } from './social-recovery-validate-share'
import { ComponentsModule } from '../../components/components.module'

@NgModule({
  declarations: [SocialRecoveryValidateSharePage],
  imports: [ComponentsModule, IonicPageModule.forChild(SocialRecoveryValidateSharePage)],
  entryComponents: [SocialRecoveryValidateSharePage]
})
export class SocialRecoveryValidateSharePageModule {}
