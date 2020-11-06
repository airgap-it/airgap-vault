import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Bip85ShowPage } from './bip85-show.page';

const routes: Routes = [
  {
    path: '',
    component: Bip85ShowPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Bip85ShowPageRoutingModule {}
