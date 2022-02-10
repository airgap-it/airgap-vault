import { TestBed } from '@angular/core/testing'

import { CoinFlipService } from './coin-flip.service'
import * as bip39 from 'bip39'

describe('CoinFlipService', () => {
  let service: CoinFlipService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(CoinFlipService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should return error on empty entropy', async () => {
    try {
      await service.getEntropyFromInput('')
    } catch (e) {
      expect(e.message).toEqual('Input length needs to be exactly 256')
    }
  })

  it('should return error on short input', async () => {
    try {
      await service.getEntropyFromInput(
        '000010110110010011111001010110011111000110101110011011000101000001110001100110111110001111110111001011100111011001101011000010000110111001000100000111110101010100011000001010100110101101001100000111101001111001000010111001101011001110110100000110110111110'
      )
    } catch (e) {
      expect(e.message).toEqual('Input length needs to be exactly 256')
    }
  })

  it('should return error on long input', async () => {
    try {
      await service.getEntropyFromInput(
        '00001011011001001111100101011001111100011010111001101100010100000111000110011011111000111111011100101110011101100110101100001000011011100100010000011111010101010001100000101010011010110100110000011110100111100100001011100110101100111011010000011011011111011'
      )
    } catch (e) {
      expect(e.message).toEqual('Input length needs to be exactly 256')
    }
  })

  it('should return error on invalid input', async () => {
    try {
      await service.getEntropyFromInput(123 as any)
    } catch (e) {
      expect(e.message).toEqual('Input needs to be a string')
    }
  })

  it('should return error on invalid characters', async () => {
    try {
      await service.getEntropyFromInput('2'.repeat(256))
    } catch (e) {
      expect(e.message).toEqual('Input can only contain "0" or "1"')
    }
  })

  it('should return error on invalid characters', async () => {
    try {
      await service.getEntropyFromInput('a'.repeat(256))
    } catch (e) {
      expect(e.message).toEqual('Input can only contain "0" or "1"')
    }
  })

  it('should return expected entropy for coin flip of length 256', async () => {
    // https://estudiobitcoin.com/do-you-trust-your-seed-dont-generate-it-yourself/
    const entropy = await service.getEntropyFromInput(
      '1110001011100101001010110011011001010010111001110100011111111111110100111001001000111101001010001100111011010011100010110111001001001010100111110101010001000000111011100100001011001001001100101010101100100000000100101101101101000011011001101001100111111001'
    )
    const expectedEntropy = bip39.mnemonicToEntropy(
      'title citizen snow place inner zoo exact element churn isolate tissue tonight prepare pretty admit sign since next siege certain reflect rebuild gun city'
    )
    expect(entropy).toEqual('e2e52b3652e747ffd3923d28ced38b724a9f5440ee42c932ab2012db436699f9')
    expect(entropy).toEqual(expectedEntropy)
  })

  it('should return expected entropy for coin flip of length 256 (2)', async () => {
    const entropy = await service.getEntropyFromInput(
      '0000101101100100111110010101100111110001101011100110110001010000011100011001101111100011111101110010111001110110011010110000100001101110010001000001111101010101000110000010101001101011010011000001111010011110010000101110011010110011101101000001101101111100'
    )
    const expectedEntropy = bip39.mnemonicToEntropy(
      'arena chief filter today traffic choice shoe ladder warm inhale onion awkward tone autumn federal aim hero genius pole magic hen sure hospital month'
    )
    expect(entropy).toEqual(expectedEntropy)
  })
})
