import { NgModule } from '@angular/core'
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  { path: '', loadChildren: './pages/tabs/tabs.module#TabsPageModule' },
  { path: 'tab-accounts', loadChildren: './pages/tab-accounts/tab-accounts.module#TabAccountsPageModule' },
  { path: 'tab-scan', loadChildren: './pages/tab-scan/tab-scan.module#TabScanPageModule' },
  { path: 'tab-settings', loadChildren: './pages/tab-settings/tab-settings.module#TabSettingsPageModule' },
  { path: 'account-add', loadChildren: './pages/account-add/account-add.module#AccountAddPageModule' },
  { path: 'secret-create', loadChildren: './pages/secret-create/secret-create.module#SecretCreatePageModule' },
  {
    path: 'secret-create/initial',
    loadChildren: './pages/secret-create/secret-create.module#SecretCreatePageModule',
    data: { initial: true }
  },
  { path: 'secret-import', loadChildren: './pages/secret-import/secret-import.module#SecretImportPageModule' },
  { path: 'secret-edit', loadChildren: './pages/secret-edit/secret-edit.module#SecretEditPageModule' },
  { path: 'warning-modal', loadChildren: './pages/warning-modal/warning-modal.module#WarningModalPageModule' },
  { path: 'introduction', loadChildren: './pages/introduction/introduction.module#IntroductionPageModule' },
  {
    path: 'distribution-onboarding',
    loadChildren: './pages/distribution-onboarding/distribution-onboarding.module#DistributionOnboardingPageModule'
  },
  { path: 'account-share', loadChildren: './pages/account-share/account-share.module#AccountSharePageModule' },
  { path: 'account-address', loadChildren: './pages/account-address/account-address.module#AccountAddressPageModule' },
  { path: 'secret-generate', loadChildren: './pages/secret-generate/secret-generate.module#SecretGeneratePageModule' },
  { path: 'secret-rules', loadChildren: './pages/secret-rules/secret-rules.module#SecretRulesPageModule' },
  { path: 'secret-show', loadChildren: './pages/secret-show/secret-show.module#SecretShowPageModule' },
  { path: 'secret-validate', loadChildren: './pages/secret-validate/secret-validate.module#SecretValidatePageModule' },
  { path: 'secret-edit', loadChildren: './pages/secret-edit/secret-edit.module#SecretEditPageModule' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
