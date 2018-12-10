import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { TabsPage } from './tabs'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [TabsPage],
  imports: [IonicPageModule.forChild(TabsPage), TranslateModule],
  entryComponents: [TabsPage]
})
export class TabsPageModule {}
