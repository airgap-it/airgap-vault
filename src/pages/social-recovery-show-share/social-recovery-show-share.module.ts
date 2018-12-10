import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { SocialRecoveryShowSharePage } from './social-recovery-show-share'
import { ComponentsModule } from '../../components/components.module'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [SocialRecoveryShowSharePage],
  imports: [ComponentsModule, IonicPageModule.forChild(SocialRecoveryShowSharePage), TranslateModule],
  entryComponents: [SocialRecoveryShowSharePage]
})
export class SocialRecoveryShowSharePageModule {}
