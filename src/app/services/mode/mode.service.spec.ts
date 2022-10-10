import { APP_PLUGIN, DeeplinkService, ISOLATED_PROTOCOL_PLUGIN, WebIsolatedProtocol } from '@airgap/angular-core'
import { TestBed } from '@angular/core/testing'

import { createAppSpy } from '../../../../test-config/plugins-mocks'
import { StorageMock } from '../../../../test-config/storage-mock'
import { UnitHelper } from '../../../../test-config/unit-test-helper'
import { InteractionService } from '../interaction/interaction.service'
import { SecretsService } from '../secrets/secrets.service'
import { SecureStorageServiceMock } from '../secure-storage/secure-storage.mock'
import { SecureStorageService } from '../secure-storage/secure-storage.service'
import { VaultStorageService } from '../storage/storage.service'

import { ModeService } from './mode.service'

describe('ModeService', () => {
  let service: ModeService
  const appSpy = createAppSpy()

  let unitHelper: UnitHelper

  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [
          ModeService,
          SecretsService,
          InteractionService,
          DeeplinkService,
          { provide: APP_PLUGIN, useValue: appSpy },
          { provide: ISOLATED_PROTOCOL_PLUGIN, useValue: new WebIsolatedProtocol() },
          { provide: VaultStorageService, useClass: StorageMock },
          { provide: SecureStorageService, useClass: SecureStorageServiceMock }
        ]
      })
    )
      .compileComponents()
      .catch(console.error)

    service = TestBed.inject(ModeService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
