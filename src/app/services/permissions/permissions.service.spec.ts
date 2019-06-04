import { TestBed } from '@angular/core/testing'

import { PermissionsService } from './permissions.service'

describe('PermissionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: PermissionsService = TestBed.get(PermissionsService)
    expect(service).toBeTruthy()
  })
})
