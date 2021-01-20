import { TestBed } from '@angular/core/testing'

import { AuditLogService } from './audit-log.service'

describe('AuditLogService', () => {
  let service: AuditLogService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(AuditLogService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
