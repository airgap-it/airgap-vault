import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'

import { TabsPage } from './tabs.page'
import { TabsPageRoutingModule } from './tabs.router.module'

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule, TabsPageRoutingModule, TranslateModule],
  declarations: [TabsPage]
})
export class TabsPageModule {}
