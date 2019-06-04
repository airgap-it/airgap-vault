import { TestBed } from '@angular/core/testing'

import { CameraService } from './camera.service'

describe('CameraService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: CameraService = TestBed.get(CameraService)
    expect(service).toBeTruthy()
  })
})
