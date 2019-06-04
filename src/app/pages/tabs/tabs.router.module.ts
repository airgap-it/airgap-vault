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
            loadChildren: '../tab-accounts/tab-accounts.module#TabAccountsPageModule'
          }
        ]
      },
      {
        path: 'tab-scan',
        children: [
          {
            path: '',
            loadChildren: '../tab-scan/tab-scan.module#TabScanPageModule'
          }
        ]
      },
      {
        path: 'tab-settings',
        children: [
          {
            path: '',
            loadChildren: '../tab-settings/tab-settings.module#TabSettingsPageModule'
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
