import { NgModule } from '@angular/core'
import { IonicPageModule, Platform } from 'ionic-angular'
import { WarningsModalPage } from './warnings-modal'
import { SecureStorageService } from '../../providers/storage/secure-storage'
import { SecureStorageFactory } from '../../providers/storage/secure-storage.factory'
import { IonicStorageModule } from '@ionic/storage'

@NgModule({
  declarations: [WarningsModalPage],
  imports: [IonicPageModule.forChild(WarningsModalPage), IonicStorageModule],
  entryComponents: [WarningsModalPage],
  providers: [
    Platform,
    {
      provide: SecureStorageService,
      useFactory: SecureStorageFactory,
      deps: [Platform]
    }
  ]
})
export class WarningsModalPageModule {}
