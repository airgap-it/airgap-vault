import { TestBed } from '@angular/core/testing'

import { IacService } from './iac.service'

describe('IacService', () => {
  let service: IacService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(IacService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
