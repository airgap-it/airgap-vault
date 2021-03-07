import { TestBed } from '@angular/core/testing'

import { DiceRollService, DiceRollType } from './dice-roll.service'
import * as bip39 from 'bip39'

describe('DiceRollService', () => {
  let service: DiceRollService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(DiceRollService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should return expected entropy for dice roll (default)', async () => {
    // https://medium.com/coinmonks/generating-device-seeds-using-dice-894082d43aea
    const entropy = await service.getEntropyFromInput(
      '661146665536425463244263515545445463645132435343342264543356444314263566145335642355541211533234355663444433431454644613'
    )
    const expectedEntropy = bip39.mnemonicToEntropy(
      'smile review wise slush foster spare spend gas normal high easy orchard feature grief amateur choose citizen lawn survey prosper reopen walnut close document'
    )
    expect(entropy).toEqual(expectedEntropy)
  })

  it('should return expected entropy for dice roll (coldcard)', async () => {
    // https://medium.com/coinmonks/generating-device-seeds-using-dice-894082d43aea
    const entropy = await service.getEntropyFromInput(
      '661146665536425463244263515545445463645132435343342264543356444314263566145335642355541211533234355663444433431454644613',
      DiceRollType.COLDCARD
    )
    const expectedEntropy = bip39.mnemonicToEntropy(
      'victory usual street wedding impact fan ridge knife bird unhappy sauce expect armor oblige fish system burst glare sense tunnel meadow infant brass guess'
    )
    expect(entropy).toEqual(expectedEntropy)
  })
})
