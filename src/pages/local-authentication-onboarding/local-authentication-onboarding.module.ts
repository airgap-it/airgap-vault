import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { LocalAuthenticationOnboardingPage } from './local-authentication-onboarding'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [LocalAuthenticationOnboardingPage],
  imports: [IonicPageModule.forChild(LocalAuthenticationOnboardingPage), TranslateModule]
})
export class LocalAuthenticationOnboardingPageModule {}
