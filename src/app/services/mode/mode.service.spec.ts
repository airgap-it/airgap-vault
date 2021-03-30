import { TestBed } from '@angular/core/testing'

import { ModeService } from './mode.service'

describe('ModeService', () => {
  let service: ModeService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(ModeService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
