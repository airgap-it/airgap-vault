import { NgModule } from '@angular/core'
import { IonicPageModule, Platform } from 'ionic-angular'
import { IntroductionPage } from './introduction'
import { IonicStorageModule } from '@ionic/storage'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [IntroductionPage],
  imports: [IonicStorageModule, IonicPageModule.forChild(IntroductionPage), TranslateModule],
  providers: [Platform],
  entryComponents: [IntroductionPage]
})
export class IntroductionPageModule {}
