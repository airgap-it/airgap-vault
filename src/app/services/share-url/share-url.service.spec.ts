import { TestBed } from '@angular/core/testing'

import { ShareUrlService } from './share-url.service'

describe('ShareUrlService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: ShareUrlService = TestBed.get(ShareUrlService)
    expect(service).toBeTruthy()
  })
})
