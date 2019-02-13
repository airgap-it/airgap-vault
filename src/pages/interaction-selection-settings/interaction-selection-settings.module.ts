import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { InteractionSelectionSettingsPage } from './interaction-selection-settings'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [InteractionSelectionSettingsPage],
  imports: [IonicPageModule.forChild(InteractionSelectionSettingsPage), TranslateModule],
  entryComponents: [InteractionSelectionSettingsPage]
})
export class InteractionSelectionSettingsPageModule {}
