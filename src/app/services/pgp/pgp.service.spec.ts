import { TestBed } from '@angular/core/testing'

import { PgpService } from './pgp.service'
import { encryptedPayload1 } from './pgp.service.spec.fixtures'

fdescribe('PgpService', () => {
  let service: PgpService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(PgpService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should encrypt text', async () => {
    const message = 'test'
    const encrypted = await service.encryptTextWithPassword(message, 'secret')
    const decrypted = await service.decryptTextWithPassword(encrypted, 'secret')

    expect(decrypted).toEqual(message)
  })

  it('should encrypt text, convert to armored and back', async () => {
    const message = 'test'
    const encrypted = await service.encryptTextWithPassword(message, 'secret')
    const armored = await service.convertBinaryToArmored(encrypted)
    const converted = await service.convertArmoredToBinary(armored)

    expect(encrypted).toEqual(converted)

    const decrypted = await service.decryptTextWithPassword(converted, 'secret')

    expect(decrypted).toEqual(message)
  })

  it('should decrypt encrypted text', async () => {
    const decrypted = await service.decryptTextWithPassword(encryptedPayload1, 'secret')

    expect(decrypted).toEqual('test')
  })
})
