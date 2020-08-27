import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IacHistoryDetailPage } from './iac-history-detail.page';

const routes: Routes = [
  {
    path: '',
    component: IacHistoryDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IacHistoryDetailPageRoutingModule {}
