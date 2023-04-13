import { ISOLATED_MODULES_PLUGIN, WebIsolatedModules } from '@airgap/angular-core'
import { TestBed } from '@angular/core/testing'
import { StorageMock } from 'test-config/storage-mock'

import { SecureStorageService } from '../secure-storage/secure-storage.service'
import { VaultStorageService } from '../storage/storage.service'

import { UnitHelper } from './../../../../test-config/unit-test-helper'
import { SecureStorageServiceMock } from './../secure-storage/secure-storage.mock'
import { SecretsService } from './secrets.service'

describe('SecretsService', () => {
  // let storageService: StorageMock
  // let secureStorageService: SecureStorageServiceMock
  // let secretsService: SecretsService
  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [
          SecretsService,
          { provide: VaultStorageService, useClass: StorageMock },
          { provide: SecureStorageService, useClass: SecureStorageServiceMock },
          { provide: ISOLATED_MODULES_PLUGIN, useValue: new WebIsolatedModules() }
        ]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  // beforeEach(() => {
  //   secureStorageService = TestBed.get(SecureStorageServiceMock)
  //   storageService = TestBed.get(Storage)
  //   secretsService = TestBed.get(SecretsService)
  // })

  it('should be created', () => {
    const secretsService: SecretsService = TestBed.get(SecretsService)
    expect(secretsService).toBeTruthy()
  })

  it('should save a newly added secret to the local storage', async () => {
    // const storageStateBefore = await storage.get('airgap-secret-list')
    // expect(storageStateBefore).toBe(undefined)
    // const secret = new Secret('topSecret')
    // await secretsService.addOrUpdateSecret(secret)
    // const storageStateAfter = await storage.get('airgap-secret-list')
    // expect(storageStateAfter.length).toBe(1)
  })
})
