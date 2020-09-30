import { TestBed } from '@angular/core/testing'

import { IACHistoryService } from './iac-history.service'

describe('IACHistoryService', () => {
  let service: IACHistoryService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(IACHistoryService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
