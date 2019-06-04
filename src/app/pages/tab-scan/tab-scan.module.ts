import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { TabScanPage } from './tab-scan.page'

const routes: Routes = [
  {
    path: '',
    component: TabScanPage
  }
]

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [TabScanPage]
})
export class TabScanPageModule {}
