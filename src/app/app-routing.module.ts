import { NgModule } from '@angular/core'
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  { path: '', loadChildren: './pages/tabs/tabs.module#TabsPageModule' },
  { path: 'tab-accounts', loadChildren: './pages/tab-accounts/tab-accounts.module#TabAccountsPageModule' },
  { path: 'tab-scan', loadChildren: './pages/tab-scan/tab-scan.module#TabScanPageModule' },
  { path: 'tab-settings', loadChildren: './pages/tab-settings/tab-settings.module#TabSettingsPageModule' },
  { path: 'account-add', loadChildren: './pages/account-add/account-add.module#AccountAddPageModule' },
  { path: 'secret-create', loadChildren: './pages/secret-create/secret-create.module#SecretCreatePageModule' },
  { path: 'secret-import', loadChildren: './pages/secret-import/secret-import.module#SecretImportPageModule' },
  { path: 'secret-edit', loadChildren: './pages/secret-edit/secret-edit.module#SecretEditPageModule' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
