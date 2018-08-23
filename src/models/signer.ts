export interface Signer {
  entropyToMnemonic(entropy: string): string
  mnemonicToEntropy(mnemonic: string): string
  generateSocialRecover(secret: string, numberOfShares: number, threshold: number): string[]
}
