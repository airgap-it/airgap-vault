import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { IonicModule, Platform, NavController } from 'ionic-angular'
import { TestModuleMetadata } from '@angular/core/testing'
import { StorageMock } from './storage-mock'
import { Storage, IonicStorageModule } from '@ionic/storage'
import { AmountConverterPipe } from '../src/components/pipes/amount-converter/amount-converter.pipe'
import { FeeConverterPipe } from '../src/components/pipes/fee-converter/fee-converter.pipe'
import { CommonModule } from '@angular/common'
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core'
import { MaterialIconsModule } from 'ionic2-material-icons'

export class UnitHelper {
  static testBed(testBed: TestModuleMetadata, useIonicOnlyTestBed = false): TestModuleMetadata {
    const mandatoryDeclarations: any[] = []
    const mandatoryImports: any[] = [
      CommonModule,
      ReactiveFormsModule,
      IonicModule,
      FormsModule,
      IonicStorageModule.forRoot({
        name: '__test_airgap_storage',
        driverOrder: ['localstorage']
      }),
      MaterialIconsModule,
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
      })
    ]
    const mandatoryProviders: any[] = [NavController, Platform]

    if (!useIonicOnlyTestBed) {
      mandatoryProviders.push({ provide: Storage, useClass: StorageMock })
      mandatoryDeclarations.push(AmountConverterPipe, FeeConverterPipe)
      mandatoryImports.push()
    }

    testBed.declarations = [...(testBed.declarations || []), ...mandatoryDeclarations]
    testBed.imports = [...(testBed.imports || []), ...mandatoryImports]
    testBed.providers = [...(testBed.providers || []), ...mandatoryProviders]

    return testBed
  }
}
