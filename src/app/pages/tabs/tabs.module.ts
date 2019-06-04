import { IonicModule } from '@ionic/angular'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'

import { TabsPageRoutingModule } from './tabs.router.module'

import { TabsPage } from './tabs.page'

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule, TabsPageRoutingModule, TranslateModule],
  declarations: [TabsPage]
})
export class TabsPageModule {}
