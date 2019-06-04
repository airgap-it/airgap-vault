import { TestBed } from '@angular/core/testing'

import { ScannerService } from './scanner.service'

describe('ScannerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ScannerService = TestBed.get(ScannerService)
    expect(service).toBeTruthy()
  })
})
