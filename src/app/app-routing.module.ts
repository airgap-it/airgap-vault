import { NgModule } from '@angular/core'
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  { path: '', loadChildren: () => import('./pages/tabs/tabs.module').then((m) => m.TabsPageModule) },
  { path: 'tabs/tab-scan', loadChildren: () => import('./pages/tab-scan/tab-scan.module').then((m) => m.TabScanPageModule) },
  {
    path: 'tabs/tab-secrets',
    loadChildren: () => import('./pages/tab-secrets/tab-secrets.module').then((m) => m.TabSecretsPageModule)
  },
  {
    path: 'tabs/tab-settings',
    loadChildren: () => import('./pages/tab-settings/tab-settings.module').then((m) => m.TabSettingsPageModule)
  },
  { path: 'account-add', loadChildren: () => import('./pages/account-add/account-add.module').then((m) => m.AccountAddPageModule) },
  { path: 'secret-setup', loadChildren: () => import('./pages/secret-setup/secret-setup.module').then((m) => m.SecretSetupPageModule) },
  {
    path: 'secret-setup/initial',
    loadChildren: () => import('./pages/secret-setup/secret-setup.module').then((m) => m.SecretSetupPageModule),
    data: { initial: true }
  },
  { path: 'secret-import', loadChildren: () => import('./pages/secret-import/secret-import.module').then((m) => m.SecretImportPageModule) },
  { path: 'secret-add', loadChildren: () => import('./pages/secret-add/secret-add.module').then((m) => m.SecretAddPageModule) },
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
    path: 'account-share-select',
    loadChildren: () => import('./pages/account-share-select/account-share-select.module').then((m) => m.AccountShareSelectPageModule)
  },
  {
    path: 'account-address',
    loadChildren: () => import('./pages/account-address/account-address.module').then((m) => m.AccountAddressPageModule)
  },
  {
    path: 'secret-generate',
    loadChildren: () => import('./pages/secret-generate/secret-generate.module').then((m) => m.SecretGeneratePageModule)
  },
  { path: 'secret-rules', loadChildren: () => import('./pages/secret-rules/secret-rules.module').then((m) => m.SecretRulesPageModule) },
  { path: 'secret-show', loadChildren: () => import('./pages/secret-show/secret-show.module').then((m) => m.SecretShowPageModule) },
  {
    path: 'secret-validate',
    loadChildren: () => import('./pages/secret-validate/secret-validate.module').then((m) => m.SecretValidatePageModule)
  },
  { path: 'secret-edit', loadChildren: () => import('./pages/secret-edit/secret-edit.module').then((m) => m.SecretEditPageModule) },
  { path: 'about', loadChildren: () => import('./pages/about/about.module').then((m) => m.AboutPageModule) },
  { path: 'shop', loadChildren: () => import('./pages/shop/shop.module').then((m) => m.ShopPageModule) },
  { path: 'advanced-mode', loadChildren: () => import('./pages/advanced-mode/advanced-mode.module').then((m) => m.AdvancedModePageModule) },
  {
    path: 'security-level-self-check',
    loadChildren: () =>
      import('./pages/security-level-self-check/security-level-self-check.module').then((m) => m.SecurityLevelSelfCheckPageModule)
  },
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
    path: 'languages-selection-settings',
    loadChildren: () =>
      import('./pages/languages-selection-settings/languages-selection-settings.module').then((m) => m.LanguagesSelectionSettingsPageModule)
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
    path: 'social-recovery-generate-intro',
    loadChildren: () =>
      import('./pages/social-recovery-generate-intro/social-recovery-generate-intro.module').then(
        (m) => m.SocialRecoveryGenerateIntroPageModule
      )
  },
  {
    path: 'social-recovery-generate-setup',
    loadChildren: () =>
      import('./pages/social-recovery-generate-setup/social-recovery-generate-setup.module').then(
        (m) => m.SocialRecoveryGenerateSetupPageModule
      )
  },
  {
    path: 'social-recovery-generate-rules',
    loadChildren: () =>
      import('./pages/social-recovery-generate-rules/social-recovery-generate-rules.module').then(
        (m) => m.SocialRecoveryGenerateRulesPageModule
      )
  },
  {
    path: 'social-recovery-generate-share-show',
    loadChildren: () =>
      import('./pages/social-recovery-generate-share-show/social-recovery-generate-share-show.module').then(
        (m) => m.SocialRecoveryGenerateShareShowPageModule
      )
  },
  {
    path: 'social-recovery-generate-share-validate',
    loadChildren: () =>
      import('./pages/social-recovery-generate-share-validate/social-recovery-generate-share-validate.module').then(
        (m) => m.SocialRecoveryGenerateShareValidatePageModule
      )
  },
  {
    path: 'social-recovery-generate-finish',
    loadChildren: () =>
      import('./pages/social-recovery-generate-finish/social-recovery-generate-finish.module').then(
        (m) => m.SocialRecoveryGenerateFinishPageModule
      )
  },
  {
    path: 'social-recovery-import',
    loadChildren: () => import('./pages/social-recovery-import/social-recovery-import.module').then((m) => m.SocialRecoveryImportPageModule)
  },
  {
    path: 'social-recovery-import-share-name',
    loadChildren: () =>
      import('./pages/social-recovery-import-share-name/social-recovery-import-share-name.module').then(
        (m) => m.SocialRecoveryImportShareNamePageModule
      )
  },
  {
    path: 'social-recovery-import-share-validate',
    loadChildren: () =>
      import('./pages/social-recovery-import-share-validate/social-recovery-import-share-validate.module').then(
        (m) => m.SocialRecoveryImportShareValidatePageModule
      )
  },
  {
    path: 'social-recovery-import-success',
    loadChildren: () =>
      import('./pages/social-recovery-import-success/social-recovery-import-success.module').then(
        (m) => m.SocialRecoveryImportSuccessPageModule
      )
  },
  {
    path: 'social-recovery-import-help',
    loadChildren: () =>
      import('./pages/social-recovery-import-help/social-recovery-import-help.module').then((m) => m.SocialRecoveryImportHelpPageModule)
  },
  {
    path: 'social-recovery-import-errors',
    loadChildren: () =>
      import('./pages/social-recovery-import-errors/social-recovery-import-errors.module').then(
        (m) => m.SocialRecoveryImportErrorsPageModule
      )
  },
  {
    path: 'social-recovery-import-intro',
    loadChildren: () =>
      import('./pages/social-recovery-import-intro/social-recovery-import-intro.module').then((m) => m.SocialRecoveryImportIntroPageModule)
  },
  {
    path: 'social-recovery-import-setup',
    loadChildren: () =>
      import('./pages/social-recovery-import-setup/social-recovery-import-setup.module').then((m) => m.SocialRecoveryImportSetupPageModule)
  },
  {
    path: 'social-recovery-setup',
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
    path: 'contact-book-contacts',
    loadChildren: () => import('./pages/contact-book-contacts/contact-book-contacts.module').then((m) => m.ContactBookContactsPageModule)
  },
  {
    path: 'contact-book-contacts-detail',
    loadChildren: () =>
      import('./pages/contact-book-contacts-detail/contact-book-contacts-detail.module').then((m) => m.ContactBookContactsDetailPageModule)
  },
  {
    path: 'contact-book-onboarding',
    loadChildren: () =>
      import('./pages/contact-book-onboarding/contact-book-onboarding.module').then((m) => m.ContactBookOnboardingPageModule)
  },
  {
    path: 'contact-book-settings',
    loadChildren: () => import('./pages/contact-book-settings/contact-book-settings.module').then((m) => m.ContactBookOnboardingPageModule)
  },

  {
    path: 'contact-book-scan',
    loadChildren: () => import('./pages/contact-book-scan/contact-book-scan.module').then((m) => m.ContactBookScanPageModule)
  },

  {
    path: 'deserialized-detail',
    loadChildren: () => import('./pages/deserialized-detail/deserialized-detail.module').then((m) => m.DeserializedDetailPageModule)
  },
  {
    path: 'transaction-signed',
    loadChildren: () => import('./pages/transaction-signed/transaction-signed.module').then((m) => m.TransactionSignedPageModule)
  },
  {
    path: 'bip85-generate',
    loadChildren: () => import('./pages/bip85-generate/bip85-generate.module').then((m) => m.Bip85GeneratePageModule)
  },
  {
    path: 'bip85-show',
    loadChildren: () => import('./pages/bip85-show/bip85-show.module').then((m) => m.Bip85ShowPageModule)
  },
  {
    path: 'select-account',
    loadChildren: () => import('./pages/select-account/select-account.module').then((m) => m.SelectAccountPageModule)
  },
  {
    path: 'qr-settings',
    loadChildren: () => import('./pages/qr-settings/qr-settings.module').then((m) => m.QrSettingsPageModule)
  },
  {
    path: 'vault-interaction-settings',
    loadChildren: () =>
      import('./pages/vault-interaction-settings/vault-interaction-settings.module').then((m) => m.VaultInteractionSettingsPageModule)
  },
  {
    path: 'migration',
    loadChildren: () => import('./pages/migration/migration.module').then((m) => m.MigrationPageModule)
  },
  {
    path: 'accounts-list',
    loadChildren: () => import('./pages/accounts-list/accounts-list.module').then((m) => m.AccountsListPageModule)
  },
  {
    path: 'secret-generate-dice',
    loadChildren: () => import('./pages/secret-generate-dice/secret-generate-dice.module').then((m) => m.SecretGenerateDicePageModule)
  },
  {
    path: 'secret-generate-coin-flip',
    loadChildren: () =>
      import('./pages/secret-generate-coin-flip/secret-generate-coin-flip.module').then((m) => m.SecretGenerateCoinFlipPageModule)
  },
  {
    path: 'wordlist',
    loadChildren: () => import('./pages/wordlist/wordlist.module').then((m) => m.WordlistPageModule)
  },
  {
    path: 'error-history',
    loadChildren: () => import('./pages/error-history/error-history.module').then((m) => m.ErrorHistoryPageModule)
  },
  {
    path: 'link-page',
    loadChildren: () => import('./pages/link-page/link-page.module').then((m) => m.LinkPagePageModule)
  },
  {
    path: 'address-explorer',
    loadChildren: () => import('./pages/address-explorer/address-explorer.module').then((m) => m.AddressExplorerPageModule)
  },
  {
    path: 'isolated-modules-list',
    loadChildren: () => import('./pages/isolated-modules-list/isolated-modules-list.module').then((m) => m.IsolatedModulesListPageModule)
  },
  {
    path: 'isolated-modules-details/:intention',
    loadChildren: () =>
      import('./pages/isolated-modules-details/isolated-modules-details.module').then((m) => m.IsolatedModulesDetailsPageModule)
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
