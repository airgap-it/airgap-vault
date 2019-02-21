import { NgModule } from '@angular/core'
import { IonicModule } from 'ionic-angular'
import { BrowserModule } from '@angular/platform-browser'
import { MaterialIconsModule } from 'ionic2-material-icons'
import { ComponentsModule } from '../components/components.module'
import { SecretGeneratePageModule } from './secret-generate/secret-generate.module'
import { SecretValidatePageModule } from './secret-validate/secret-validate.module'
import { SecretCreatePageModule } from './secret-create/secret-create.module'
import { SecretEditPageModule } from './secret-edit/secret-edit.module'
import { SecretRulesPageModule } from './secret-rules/secret-rules.module'
import { SecretShowPageModule } from './secret-show/secret-show.module'
import { WalletAddressPageModule } from './wallet-address/wallet-address.module'
import { TabsPageModule } from './tabs/tabs.module'
import { TabSettingsPageModule } from './tab-settings/tab-settings.module'
import { TransactionDetailPageModule } from './transaction-detail/transaction-detail.module'
import { TransactionSignedPageModule } from './transaction-signed/transaction-signed.module'
import { TabWalletsPageModule } from './tab-wallets/tab-wallets.module'
import { SecretImportPageModule } from './secret-import/secret-import.module'
import { WarningsModalPageModule } from './warnings-modal/warnings-modal.module'
import { SocialRecoverySetupPageModule } from './social-recovery-setup/social-recovery-setup.module'
import { TabScanPageModule } from './tab-scan/tab-scan.module'
import { WalletSelectCoinsPageModule } from './wallet-select-coins/wallet-select-coins.module'
import { SocialRecoveryShowSharePageModule } from './social-recovery-show-share/social-recovery-show-share.module'
import { SocialRecoveryValidateSharePageModule } from './social-recovery-validate-share/social-recovery-validate-share.module'
import { WalletSharePageModule } from './wallet-share/wallet-share.module'
import { SocialRecoveryImportPageModule } from './social-recovery-import/social-recovery-import.module'
import { IntroductionPageModule } from '../pages/introduction/introduction.module'
import { LocalAuthenticationOnboardingPageModule } from './local-authentication-onboarding/local-authentication-onboarding.module'
import { SecretGenerateOnboardingPageModule } from './secret-generate-onboarding/secret-generate-onboarding.module'
import { DistributionOnboardingPageModule } from './distribution-onboarding/distribution-onboarding.module'
import { InteractionSelectionPageModule } from './interaction-selection/interaction-selection.module'
import { InteractionSelectionSettingsPageModule } from './interaction-selection-settings/interaction-selection-settings.module'

@NgModule({
  imports: [
    IonicModule,
    BrowserModule,
    MaterialIconsModule,
    ComponentsModule,
    SecretGeneratePageModule,
    SecretGenerateOnboardingPageModule,
    SecretValidatePageModule,
    SecretCreatePageModule,
    SecretEditPageModule,
    SecretRulesPageModule,
    SecretShowPageModule,
    WalletAddressPageModule,
    WalletSharePageModule,
    TabsPageModule,
    TabSettingsPageModule,
    TabScanPageModule,
    TransactionDetailPageModule,
    TransactionSignedPageModule,
    TabWalletsPageModule,
    SecretImportPageModule,
    WarningsModalPageModule,
    SocialRecoverySetupPageModule,
    SocialRecoveryShowSharePageModule,
    SocialRecoveryValidateSharePageModule,
    SocialRecoveryImportPageModule,
    WalletSelectCoinsPageModule,
    LocalAuthenticationOnboardingPageModule,
    DistributionOnboardingPageModule,
    IntroductionPageModule,
    InteractionSelectionPageModule,
    InteractionSelectionSettingsPageModule
  ],
  exports: []
})
export class PagesModule {}
