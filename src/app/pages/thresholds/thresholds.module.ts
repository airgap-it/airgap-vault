import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { ComponentsModule } from 'src/app/components/components.module'

import { ThresholdsPageRoutingModule } from './thresholds-routing.module'
import { ThresholdsPage } from './thresholds.page'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ThresholdsPageRoutingModule, ComponentsModule],
  declarations: [ThresholdsPage]
})
export class ThresholdsPageModule {}
