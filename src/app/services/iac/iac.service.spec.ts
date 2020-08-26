import { TestBed } from '@angular/core/testing'

import { IACService } from './iac.service'

import { UnitHelper } from '../../../../test-config/unit-test-helper'

describe('IACService', () => {
  let service: IACService

  let unitHelper: UnitHelper

  beforeEach(() => {
    unitHelper = new UnitHelper()

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: []
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(async () => {
    service = TestBed.get(IACService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
