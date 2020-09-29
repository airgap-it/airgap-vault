import { TestBed } from '@angular/core/testing'

import { PeerService } from './peer.service'

describe('PeerService', () => {
  let service: PeerService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(PeerService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
