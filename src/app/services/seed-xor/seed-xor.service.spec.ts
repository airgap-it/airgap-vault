import { TestBed } from '@angular/core/testing'

import { SeedXorService } from './seed-xor.service'

// https://github.com/Coldcard/firmware/blob/1c47b073fc933b2e216d73c980db9d3231b8dd30/docs/seed-xor.md#xor-seed-example-using-3-parts
const share1 =
  'romance wink lottery autumn shop bring dawn tongue range crater truth ability miss spice fitness easy legal release recall obey exchange recycle dragon room'
const share2 =
  'lion misery divide hurry latin fluid camp advance illegal lab pyramid unaware eager fringe sick camera series noodle toy crowd jeans select depth lounge'
const share3 =
  'vault nominee cradle silk own frown throw leg cactus recall talent worry gadget surface shy planet purpose coffee drip few seven term squeeze educate'
const combined =
  'silent toe meat possible chair blossom wait occur this worth option bag nurse find fish scene bench asthma bike wage world quit primary indoor'

describe('SeedXorService', () => {
  let service: SeedXorService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(SeedXorService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should be combine shares correctly', async () => {
    const res = await service.combine([share1, share2, share3])
    expect(res).toEqual(combined)
  })
})
