import { TestBed } from '@angular/core/testing'

import { CoinFlipService } from './coin-flip.service'

describe('CoinFlipService', () => {
  let service: CoinFlipService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(CoinFlipService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should return expected entropy for coin flip of length 256', async () => {
    // https://estudiobitcoin.com/do-you-trust-your-seed-dont-generate-it-yourself/
    const entropy = await service.getEntropyFromInput(
      '1110001011100101001010110011011001010010111001110100011111111111110100111001001000111101001010001100111011010011100010110111001001001010100111110101010001000000111011100100001011001001001100101010101100100000000100101101101101000011011001101001100111111001'
    )
    expect(entropy).toEqual('e2e52b3652e747ffd3923d28ced38b724a9f5440ee42c932ab2012db436699f9')
  })
})
