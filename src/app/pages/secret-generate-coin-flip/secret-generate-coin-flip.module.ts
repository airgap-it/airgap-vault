import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { SecretGenerateCoinFlipPageRoutingModule } from './secret-generate-coin-flip-routing.module'

import { SecretGenerateCoinFlipPage } from './secret-generate-coin-flip.page'
import { TranslateModule } from '@ngx-translate/core'
import { ComponentsModule } from 'src/app/components/components.module'

@NgModule({
  imports: [CommonModule, ComponentsModule, FormsModule, IonicModule, SecretGenerateCoinFlipPageRoutingModule, TranslateModule],
  declarations: [SecretGenerateCoinFlipPage]
})
export class SecretGenerateCoinFlipPageModule {}
