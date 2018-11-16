import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LocalAuthenticationOnboardingPage } from './local-authentication-onboarding';

@NgModule({
  declarations: [
    LocalAuthenticationOnboardingPage,
  ],
  imports: [
    IonicPageModule.forChild(LocalAuthenticationOnboardingPage),
  ],
})
export class LocalAuthenticationOnboardingPageModule {}
