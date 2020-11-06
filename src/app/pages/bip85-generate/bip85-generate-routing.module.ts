import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Bip85GeneratePage } from './bip85-generate.page';

const routes: Routes = [
  {
    path: '',
    component: Bip85GeneratePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Bip85GeneratePageRoutingModule {}
