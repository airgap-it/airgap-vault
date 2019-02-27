import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { InteractionSelectionPage } from './interaction-selection'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [InteractionSelectionPage],
  imports: [IonicPageModule.forChild(InteractionSelectionPage), TranslateModule],
  entryComponents: [InteractionSelectionPage]
})
export class InteractionSelectionPageModule {}
