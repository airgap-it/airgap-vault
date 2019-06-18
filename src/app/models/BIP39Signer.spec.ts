import { BIP39Signer } from './BIP39Signer'

// tslint:disable:no-console

const printError: (error: Error) => void = (error: Error): void => {
  console.log(error)
}

describe('BIP39: Signer', () => {
  const signer: BIP39Signer = new BIP39Signer()

  // Test with different secret lengths
  const secrets: string[] = [
    'police fade pink dose curious bid mixed blade rotate food situate junk rival torch inflict poem shrimp owner grant cable cook bless swarm curious',
    'clarify excuse sunny crazy can aerobic harbor imitate shuffle hurry vacuum object captain miss unveil oval answer retreat',
    'ozone supply spread pipe frown bread squirrel life split heart pave avoid'
  ]

  it('create an instance', () => {
    expect(signer).toBeTruthy()
  })

  it('generates same seed from same entropy', () => {
    const expectedSecret: string =
      'demise stem detect together legal stand road industry thought casino danger arrow busy kick tide female own ship'
    const secret: string = signer.entropyToMnemonic('3a5aa8f1f1d7f7a92ebb99e0e46cdd8651f2f47872a79e18')
    expect(secret).toBe(expectedSecret)
  })

  it('generates correct social recovery keys, 24 words seed', () => {
    const numberOfShares: number = 5
    const threshold: number = 3

    const shares: string[] = signer.generateSocialRecover(secrets[0], numberOfShares, threshold)
    const restoredSecretFull: string = signer.recoverKey(shares)
    const restoredSecretExact: string = signer.recoverKey(shares.slice(0, threshold))

    expect(shares.length).toBe(numberOfShares)
    expect(restoredSecretFull).toBe(secrets[0])
    expect(restoredSecretExact).toBe(secrets[0])

    expect(() => {
      signer.recoverKey(shares.slice(0, threshold - 1))
    }).toThrowError(
      'Checksum error, either the passed shares were generated for different secrets or the amount of shares is below the threshold'
    )
  })

  it('generates correct social recovery keys, 18 words seed', () => {
    const numberOfShares: number = 5
    const threshold: number = 3

    const shares: string[] = signer.generateSocialRecover(secrets[1], numberOfShares, threshold)
    const restoredSecretFull: string = signer.recoverKey(shares)
    const restoredSecretExact: string = signer.recoverKey(shares.slice(0, threshold))

    expect(shares.length).toBe(numberOfShares)
    expect(restoredSecretFull).toBe(secrets[1])
    expect(restoredSecretExact).toBe(secrets[1])

    expect(() => {
      signer.recoverKey(shares.slice(0, threshold - 1))
    }).toThrowError(
      'Checksum error, either the passed shares were generated for different secrets or the amount of shares is below the threshold'
    )
  })

  it('generates correct social recovery keys, 12 words seed', () => {
    const numberOfShares: number = 5
    const threshold: number = 3

    const shares = signer.generateSocialRecover(secrets[2], numberOfShares, threshold)
    const restoredSecretFull = signer.recoverKey(shares)
    const restoredSecretExact = signer.recoverKey(shares.slice(0, threshold))

    expect(shares.length).toBe(numberOfShares)
    expect(restoredSecretFull).toBe(secrets[2])
    expect(restoredSecretExact).toBe(secrets[2])

    expect(() => {
      signer.recoverKey(shares.slice(0, threshold - 1))
    }).toThrowError(
      'Checksum error, either the passed shares were generated for different secrets or the amount of shares is below the threshold'
    )
  })

  it('throw error on wrong threshold configuration', () => {
    const numberOfShares: number = 5
    const threshold: number = 6

    expect(() => {
      signer.generateSocialRecover(secrets[0], numberOfShares, threshold)
    }).toThrowError('The threshold needs to be smaller or equal to the number or shares')
  })

  it('throw error on wrong numberOfShares configuration', () => {
    const numberOfShares: number = 1
    const threshold: number = 1

    expect(() => {
      signer.generateSocialRecover(secrets[0], numberOfShares, threshold)
    }).toThrowError('At least two shares are needed')
  })

  it('throw error on wrong numberOfShares configuration', () => {
    const numberOfShares: number = 1
    const threshold: number = 1

    expect(() => {
      signer.generateSocialRecover(secrets[0], numberOfShares, threshold)
    }).toThrowError('At least two shares are needed')
  })
})
