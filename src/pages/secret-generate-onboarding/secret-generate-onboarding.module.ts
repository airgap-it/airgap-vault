import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { SecretGenerateOnboardingPage } from './secret-generate-onboarding'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [SecretGenerateOnboardingPage],
  imports: [IonicPageModule.forChild(SecretGenerateOnboardingPage), TranslateModule]
})
export class SecretGenerateOnboardingPageModule {}
