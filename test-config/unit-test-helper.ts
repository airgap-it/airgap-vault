import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { TestModuleMetadata } from '@angular/core/testing'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterTestingModule } from '@angular/router/testing'
import { AlertController, IonicModule, NavController, Platform, ToastController } from '@ionic/angular'
import { IonicStorageModule, Storage } from '@ionic/storage'
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core'

import { ComponentsModule } from '../src/app/components/components.module'
import { PipesModule } from '../src/app/pipes/pipes.module'

import {
  AlertControllerMock,
  DeeplinkMock,
  LoadingControllerMock,
  ModalControllerMock,
  NavControllerMock,
  PlatformMock,
  ToastControllerMock
} from './ionic-mocks'
import { AppInfoPluginMock, SaplingPluginMock, SplashScreenMock, StatusBarMock } from './plugins-mocks'
import { StorageMock } from './storage-mock'
import { APP_CONFIG } from '@airgap/angular-core'
import { appConfig } from 'src/app/config/app-config'

export class UnitHelper {
  public readonly mockRefs = {
    appInfo: new AppInfoPluginMock(),
    platform: new PlatformMock(),
    sapling: new SaplingPluginMock(),
    statusBar: new StatusBarMock(),
    splashScreen: new SplashScreenMock(),
    deeplink: new DeeplinkMock(),
    toastController: new ToastControllerMock(),
    alertController: new AlertControllerMock(),
    loadingController: new LoadingControllerMock(),
    modalController: new ModalControllerMock()
  }

  public testBed(testBed: TestModuleMetadata, useIonicOnlyTestBed: boolean = false): TestModuleMetadata {
    const mandatoryDeclarations: any[] = []
    const mandatoryImports: any[] = [
      CommonModule,
      ReactiveFormsModule,
      IonicModule,
      FormsModule,
      RouterTestingModule,
      HttpClientModule,
      ComponentsModule,
      IonicStorageModule.forRoot({
        name: '__test_airgap_storage',
        driverOrder: ['localstorage']
      }),
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
      })
    ]
    const mandatoryProviders: any[] = [
      { provide: NavController, useClass: NavControllerMock },
      { provide: Platform, useValue: this.mockRefs.platform },
      { provide: ToastController, useValue: this.mockRefs.toastController },
      { provide: AlertController, useValue: this.mockRefs.alertController },
      { provide: APP_CONFIG, useValue: appConfig }
    ]

    if (!useIonicOnlyTestBed) {
      mandatoryProviders.push({ provide: Storage, useClass: StorageMock })
      mandatoryDeclarations.push()
      mandatoryImports.push(PipesModule)
    }

    testBed.declarations = [...(testBed.declarations || []), ...mandatoryDeclarations]
    testBed.imports = [...(testBed.imports || []), ...mandatoryImports]
    testBed.providers = [...(testBed.providers || []), ...mandatoryProviders]

    return testBed
  }
}

export const newSpy: (name: string, returnValue: any) => jasmine.Spy = (name: string, returnValue: any): jasmine.Spy =>
  jasmine.createSpy(name).and.returnValue(returnValue)
