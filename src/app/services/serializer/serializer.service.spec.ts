import { TestBed } from '@angular/core/testing'

import { SerializerService } from './serializer.service'

describe('SerializerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: SerializerService = TestBed.get(SerializerService)
    expect(service).toBeTruthy()
  })
})
