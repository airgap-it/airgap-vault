import { TestBed } from '@angular/core/testing'

import { TotpService } from './totp.service'

describe('TotpService', () => {
  let service: TotpService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(TotpService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
