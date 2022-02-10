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

  it('should return error on empty entropy', async () => {
    try {
      await service.getEntropyFromInput('')
    } catch (e) {
      expect(e.message).toEqual('Input length needs to be longer than 99')
    }
  })

  it('should return error on invalid input', async () => {
    try {
      await service.getEntropyFromInput(123 as any)
    } catch (e) {
      expect(e.message).toEqual('Input needs to be a string')
    }
  })

  it('should return error on short input', async () => {
    try {
      await service.getEntropyFromInput('41155615566552152212233416526155436411624125534136')
    } catch (e) {
      expect(e.message).toEqual('Input length needs to be longer than 99')
    }
  })

  it('should return error on invalid characters', async () => {
    try {
      await service.getEntropyFromInput(
        '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
      )
    } catch (e) {
      expect(e.message).toEqual('Input can only contain "1", "2", "3", "4", "5" and "6"')
    }
  })

  it('should return error on invalid characters', async () => {
    try {
      await service.getEntropyFromInput(
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      )
    } catch (e) {
      expect(e.message).toEqual('Input can only contain "1", "2", "3", "4", "5" and "6"')
    }
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

  it('should return expected entropy for dice roll 2 (default)', async () => {
    const entropy = await service.getEntropyFromInput(
      '62164665355464125621655555115116161514443563652333411313422142651342152616654455133531453511346463122625542344531556546314233121145552526413561625234451654154312625113642343441561213332125353422441646'
    )
    const expectedEntropy = bip39.mnemonicToEntropy(
      'ceiling subway river trumpet become game shield impact inmate tool short goat capable beef eager dolphin bridge float month focus usual vote clean eager'
    )
    expect(entropy).toEqual(expectedEntropy)
  })

  it('should return expected entropy for dice roll 2 (coldcard)', async () => {
    const entropy = await service.getEntropyFromInput(
      '62164665355464125621655555115116161514443563652333411313422142651342152616654455133531453511346463122625542344531556546314233121145552526413561625234451654154312625113642343441561213332125353422441646',
      DiceRollType.COLDCARD
    )
    const expectedEntropy = bip39.mnemonicToEntropy(
      'easily retire frog bitter renew breeze smart vault youth sunset banner pink debris gloom magic memory dice defense ten core bubble sure smart just'
    )
    expect(entropy).toEqual(expectedEntropy)
  })
})
