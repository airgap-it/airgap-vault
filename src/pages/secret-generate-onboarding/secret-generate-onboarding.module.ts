import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SecretGenerateOnboardingPage } from './secret-generate-onboarding';

@NgModule({
  declarations: [
    SecretGenerateOnboardingPage,
  ],
  imports: [
    IonicPageModule.forChild(SecretGenerateOnboardingPage),
  ],
})
export class SecretGenerateOnboardingPageModule {}
