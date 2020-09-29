import { TestBed } from '@angular/core/testing'

import { IacHistoryService } from './iac-history.service'

describe('IacHistoryService', () => {
  let service: IacHistoryService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(IacHistoryService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
