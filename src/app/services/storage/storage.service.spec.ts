import { TestBed } from '@angular/core/testing'

import { SecureStorageService } from './storage.service'

describe('StorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: SecureStorageService = TestBed.get(SecureStorageService)
    expect(service).toBeTruthy()
  })
})
