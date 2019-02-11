import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { ComponentsModule } from '../../components/components.module'
import { MaterialIconsModule } from 'ionic2-material-icons'
import { TranslateModule } from '@ngx-translate/core'
import { TabSettingsPage } from './tab-settings'

@NgModule({
  declarations: [TabSettingsPage],
  imports: [ComponentsModule, MaterialIconsModule, IonicPageModule.forChild(TabSettingsPage), TranslateModule],
  entryComponents: [TabSettingsPage]
})
export class TabSettingsPageModule {}
