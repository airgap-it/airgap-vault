import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { TabsPage } from './tabs.page'

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab-scan',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab-scan/tab-scan.module').then((m) => m.TabScanPageModule)
          }
        ]
      },
      {
        path: 'tab-contacts',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab-contacts/tab-contacts.module').then((m) => m.TabContactsPageModule)
          }
        ]
      },
      {
        path: 'tab-secrets',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab-secrets/tab-secrets.module').then((m) => m.TabSecretsPageModule)
          }
        ]
      },
      {
        path: 'tab-settings',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab-settings/tab-settings.module').then((m) => m.TabSettingsPageModule)
          }
        ]
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab-secrets',
    pathMatch: 'full'
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
