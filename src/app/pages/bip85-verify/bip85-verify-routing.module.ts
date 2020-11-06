import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Bip85VerifyPage } from './bip85-verify.page';

const routes: Routes = [
  {
    path: '',
    component: Bip85VerifyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Bip85VerifyPageRoutingModule {}
