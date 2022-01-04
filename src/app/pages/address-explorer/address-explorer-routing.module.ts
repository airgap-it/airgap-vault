import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddressExplorerPage } from './address-explorer.page';

const routes: Routes = [
  {
    path: '',
    component: AddressExplorerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddressExplorerPageRoutingModule {}
