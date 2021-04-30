import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { SeedXorImportPageRoutingModule } from './seed-xor-import-routing.module'

import { SeedXorImportPage } from './seed-xor-import.page'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, SeedXorImportPageRoutingModule, TranslateModule],
  declarations: [SeedXorImportPage]
})
export class SeedXorImportPageModule {}
