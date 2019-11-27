import { TestBed } from '@angular/core/testing'
import { Storage } from '@ionic/storage'
import { StorageMock } from 'test-config/storage-mock'
import { UnitHelper } from 'test-config/unit-test-helper'

import { StorageService } from './storage.service'

describe('StorageService', () => {
  beforeEach(() => {
    let unitHelper: UnitHelper
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [{ provide: Storage, useClass: StorageMock }]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  it('should be created', () => {
    const service: StorageService = TestBed.get(StorageService)
    expect(service).toBeTruthy()
  })
})
