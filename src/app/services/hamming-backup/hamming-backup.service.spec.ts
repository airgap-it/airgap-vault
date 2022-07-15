import { TestBed } from '@angular/core/testing'
import { SeedXorService } from '../seed-xor/seed-xor.service'

import { HammingBackupService } from './hamming-backup.service'

// https://gitlab.com/apgoucher/hamming-backups/-/blob/master/test_vectors.py

// here, X represents the 'original secret' seed phrase.
const X =
  'useless theme rescue solve stable idea render cotton run round fiscal push correct fish frown miss endless floor nasty wild squirrel long process vacant'

// A, B, and C are the three parts of a Hamming backup of X.
// A was generated randomly; (B, C) were computed from (X, A).
const A =
  'eight camera discover pink leg picture color afford cheap flip panel coffee damage open seminar hood park roof indoor merge female honey rack blossom'
const B =
  'door umbrella path easily note educate snow inject payment retire loyal stand major novel stairs tower topple minute ancient soul elite grit glory harvest'
const C =
  'wasp clutch circle common demand naive file doll deliver family erode finish limit fortune engage allow art hurdle trim save soon marriage joy loyal'

describe('HammingBackupService', () => {
  let service: HammingBackupService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(HammingBackupService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should combine shares correctly', async () => {
    expect(service.hamming_backup(X, A)).toEqual([B, C])

    expect(service.hamming_backup(A, B)).toEqual([X, C])
    expect(service.hamming_backup(B, C)).toEqual([X, A])
    expect(service.hamming_backup(C, A)).toEqual([X, B])
    expect(service.hamming_backup(B, A)).toEqual([C, X])
    expect(service.hamming_backup(C, B)).toEqual([A, X])
    expect(service.hamming_backup(A, C)).toEqual([B, X])
  })

  it('should combine all shares as seedxor', async () => {
    const seedxor = new SeedXorService()

    expect(seedxor.combine([A, B, C])).toEqual(X)
  })

  // it('should split shares correctly with known seed', async () => {
  //   const res = await service.combine([share1, share2, share3])
  //   expect(res).toEqual(combined)
  // })

  // it('should split shares and combine with random seed', async () => {
  //   const res = await service.combine([share1, share2, share3])
  //   expect(res).toEqual(combined)
  // })
})
