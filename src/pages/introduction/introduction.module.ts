import { NgModule } from '@angular/core'
import { IonicPageModule, Platform } from 'ionic-angular'
import { IntroductionPage } from './introduction'
import { IonicStorageModule } from '@ionic/storage'

@NgModule({
  declarations: [
    IntroductionPage
  ],
  imports: [
    IonicStorageModule,
    IonicPageModule.forChild(IntroductionPage)
  ],
  providers: [
    Platform
  ],
  entryComponents: [
    IntroductionPage
  ]
})

export class IntroductionPageModule {}
