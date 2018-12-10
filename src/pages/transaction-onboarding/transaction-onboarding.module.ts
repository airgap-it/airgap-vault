import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { TransactionOnboardingPage } from './transaction-onboarding'
import { TransactionSignedPageModule } from '../transaction-signed/transaction-signed.module'
import { ComponentsModule } from '../../components/components.module'
import { IonicStorageModule } from '@ionic/storage'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [TransactionOnboardingPage],
  imports: [
    ComponentsModule,
    TransactionSignedPageModule,
    IonicStorageModule,
    IonicPageModule.forChild(TransactionOnboardingPage),
    TranslateModule
  ],
  entryComponents: [TransactionOnboardingPage]
})
export class TransactionOnboardingPageModule {}
