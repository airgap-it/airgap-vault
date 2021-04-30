import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { SeedXorGeneratePageRoutingModule } from './seed-xor-generate-routing.module'

import { SeedXorGeneratePage } from './seed-xor-generate.page'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SeedXorGeneratePageRoutingModule],
  declarations: [SeedXorGeneratePage]
})
export class SeedXorGeneratePageModule {}
