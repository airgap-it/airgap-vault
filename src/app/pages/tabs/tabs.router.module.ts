import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { TabsPage } from './tabs.page'

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab-accounts',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab-accounts/tab-accounts.module').then(m => m.TabAccountsPageModule)
          }
        ]
      },
      {
        path: 'tab-scan',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab-scan/tab-scan.module').then(m => m.TabScanPageModule)
          }
        ]
      },
      {
        path: 'tab-settings',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab-settings/tab-settings.module').then(m => m.TabSettingsPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/tab-accounts',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab-accounts',
    pathMatch: 'full'
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
