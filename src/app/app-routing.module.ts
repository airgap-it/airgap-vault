import { NgModule } from '@angular/core'
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  { path: '', loadChildren: './pages/tabs/tabs.module#TabsPageModule' },
  { path: 'tab-accounts', loadChildren: './pages/tab-accounts/tab-accounts.module#TabAccountsPageModule' },
  { path: 'tab-scan', loadChildren: './pages/tab-scan/tab-scan.module#TabScanPageModule' },
  { path: 'tab-settings', loadChildren: './pages/tab-settings/tab-settings.module#TabSettingsPageModule' },
  { path: 'account-add', loadChildren: './pages/account-add/account-add.module#AccountAddPageModule' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
