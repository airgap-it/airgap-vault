import { TestBed } from '@angular/core/testing'

import { SchemeRoutingService } from './scheme-routing.service'

describe('SchemeRoutingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: SchemeRoutingService = TestBed.get(SchemeRoutingService)
    expect(service).toBeTruthy()
  })
})
