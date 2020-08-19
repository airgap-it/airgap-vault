import { NgModule } from '@angular/core'
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  { path: '', loadChildren: () => import('./pages/tabs/tabs.module').then((m) => m.TabsPageModule) },
  { path: 'tab-accounts', loadChildren: () => import('./pages/tab-accounts/tab-accounts.module').then((m) => m.TabAccountsPageModule) },
  { path: 'tab-scan', loadChildren: () => import('./pages/tab-scan/tab-scan.module').then((m) => m.TabScanPageModule) },
  { path: 'tab-settings', loadChildren: () => import('./pages/tab-settings/tab-settings.module').then((m) => m.TabSettingsPageModule) },
  { path: 'account-add', loadChildren: () => import('./pages/account-add/account-add.module').then((m) => m.AccountAddPageModule) },
  { path: 'secret-create', loadChildren: () => import('./pages/secret-create/secret-create.module').then((m) => m.SecretCreatePageModule) },
  {
    path: 'secret-create/initial',
    loadChildren: () => import('./pages/secret-create/secret-create.module').then((m) => m.SecretCreatePageModule),
    data: { initial: true }
  },
  { path: 'secret-import', loadChildren: () => import('./pages/secret-import/secret-import.module').then((m) => m.SecretImportPageModule) },
  { path: 'secret-edit', loadChildren: () => import('./pages/secret-edit/secret-edit.module').then((m) => m.SecretEditPageModule) },
  { path: 'warning-modal', loadChildren: () => import('./pages/warning-modal/warning-modal.module').then((m) => m.WarningModalPageModule) },
  { path: 'introduction', loadChildren: () => import('./pages/introduction/introduction.module').then((m) => m.IntroductionPageModule) },
  {
    path: 'distribution-onboarding',
    loadChildren: () =>
      import('./pages/distribution-onboarding/distribution-onboarding.module').then((m) => m.DistributionOnboardingPageModule)
  },
  { path: 'account-share', loadChildren: () => import('./pages/account-share/account-share.module').then((m) => m.AccountSharePageModule) },
  {
    path: 'account-address/:secretID/:protocol/:publicKey',
    loadChildren: () => import('./pages/account-address/account-address.module').then((m) => m.AccountAddressPageModule)
  },
  {
    path: 'secret-generate',
    loadChildren: () => import('./pages/secret-generate/secret-generate.module').then((m) => m.SecretGeneratePageModule)
  },
  {
    path: 'secret-rules/:secretID',
    loadChildren: () => import('./pages/secret-rules/secret-rules.module').then((m) => m.SecretRulesPageModule)
  },
  {
    path: 'secret-show/:secretID',
    loadChildren: () => import('./pages/secret-show/secret-show.module').then((m) => m.SecretShowPageModule)
  },
  {
    path: 'secret-validate/:secretID',
    loadChildren: () => import('./pages/secret-validate/secret-validate.module').then((m) => m.SecretValidatePageModule)
  },
  {
    path: 'secret-edit/:secretID/:isGenerating',
    loadChildren: () => import('./pages/secret-edit/secret-edit.module').then((m) => m.SecretEditPageModule)
  },
  { path: 'about', loadChildren: () => import('./pages/about/about.module').then((m) => m.AboutPageModule) },
  {
    path: 'interaction-selection',
    loadChildren: () => import('./pages/interaction-selection/interaction-selection.module').then((m) => m.InteractionSelectionPageModule)
  },
  {
    path: 'interaction-selection-settings',
    loadChildren: () =>
      import('./pages/interaction-selection-settings/interaction-selection-settings.module').then(
        (m) => m.InteractionSelectionSettingsPageModule
      )
  },
  {
    path: 'local-authentication-onboarding',
    loadChildren: () =>
      import('./pages/local-authentication-onboarding/local-authentication-onboarding.module').then(
        (m) => m.LocalAuthenticationOnboardingPageModule
      )
  },
  {
    path: 'secret-generate-onboarding',
    loadChildren: () =>
      import('./pages/secret-generate-onboarding/secret-generate-onboarding.module').then((m) => m.SecretGenerateOnboardingPageModule)
  },
  {
    path: 'social-recovery-import',
    loadChildren: () => import('./pages/social-recovery-import/social-recovery-import.module').then((m) => m.SocialRecoveryImportPageModule)
  },
  {
    path: 'social-recovery-setup/:secretID',
    loadChildren: () => import('./pages/social-recovery-setup/social-recovery-setup.module').then((m) => m.SocialRecoverySetupPageModule)
  },
  {
    path: 'social-recovery-show-share',
    loadChildren: () =>
      import('./pages/social-recovery-show-share/social-recovery-show-share.module').then((m) => m.SocialRecoveryShowSharePageModule)
  },
  {
    path: 'social-recovery-validate-share',
    loadChildren: () =>
      import('./pages/social-recovery-validate-share/social-recovery-validate-share.module').then(
        (m) => m.SocialRecoveryValidateSharePageModule
      )
  },
  {
    path: 'transaction-detail',
    loadChildren: () => import('./pages/transaction-detail/transaction-detail.module').then((m) => m.TransactionDetailPageModule)
  },
  {
    path: 'transaction-signed',
    loadChildren: () => import('./pages/transaction-signed/transaction-signed.module').then((m) => m.TransactionSignedPageModule)
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
