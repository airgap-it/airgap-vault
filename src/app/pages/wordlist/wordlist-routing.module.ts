import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WordlistPage } from './wordlist.page';

const routes: Routes = [
  {
    path: '',
    component: WordlistPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WordlistPageRoutingModule {}
