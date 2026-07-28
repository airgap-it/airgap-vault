import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SecretSeedqrTemplatePage } from './secret-seedqr-template.page';

const routes: Routes = [
  {
    path: '',
    component: SecretSeedqrTemplatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecretSeedqrTemplatePageRoutingModule {}
