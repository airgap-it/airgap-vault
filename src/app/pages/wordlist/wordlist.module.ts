import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { WordlistPageRoutingModule } from './wordlist-routing.module'

import { WordlistPage } from './wordlist.page'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, TranslateModule, WordlistPageRoutingModule],
  declarations: [WordlistPage]
})
export class WordlistPageModule {}
