import { StorageMock } from 'test-config/storage-mock'
import { SecureStorageServiceMock } from './../secure-storage/secure-storage.mock'
import { UnitHelper } from './../../../../test-config/unit-test-helper'
import { TestBed, async } from '@angular/core/testing'
import { SecretsService } from './secrets.service'
import { SecureStorageService } from '../secure-storage/secure-storage.service'
import { Storage } from '@ionic/storage'
import { Secret } from 'src/app/models/secret'

describe('SecretsService', () => {
  let storage: StorageMock
  let secureStorageService: SecureStorageServiceMock
  let secretsService: SecretsService
  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [
          SecretsService,
          { provide: Storage, useClass: StorageMock },
          { provide: SecureStorageService, useClass: SecureStorageServiceMock }
        ]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(() => {
    secureStorageService = TestBed.get(SecureStorageServiceMock)
    storage = TestBed.get(Storage)
    secretsService = TestBed.get(SecretsService)
  })

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
