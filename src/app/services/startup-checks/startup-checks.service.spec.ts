import { TestBed } from '@angular/core/testing'

import { StartupChecksService } from './startup-checks.service'

describe('StartupChecksService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: StartupChecksService = TestBed.get(StartupChecksService)
    expect(service).toBeTruthy()
  })
})
