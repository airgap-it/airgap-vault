import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { DistributionOnboardingPage } from './distribution-onboarding'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [DistributionOnboardingPage],
  imports: [IonicPageModule.forChild(DistributionOnboardingPage), TranslateModule]
})
export class DistributionOnboardingPageModule {}
