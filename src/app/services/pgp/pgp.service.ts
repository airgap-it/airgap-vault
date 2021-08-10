import { Injectable } from '@angular/core'

import {
  enums,
  createMessage,
  decrypt,
  decryptKey,
  encrypt,
  readKey,
  readMessage,
  readPrivateKey
  // createCleartextMessage,
  // sign,
  // readCleartextMessage,
  // verify,
  // readSignature,
} from 'openpgp'

import { readToEnd } from '@openpgp/web-stream-tools'

@Injectable({
  providedIn: 'root'
})
export class PgpService {
  constructor() {}

  async convertBinaryToArmored(binaryMessage: Uint8Array): Promise<string> {
    const message = await readMessage({
      binaryMessage
    })
    return readToEnd(message.armor())
  }

  async convertArmoredToBinary(armoredMessage: string): Promise<Uint8Array> {
    const message = await readMessage({
      armoredMessage
    })
    return readToEnd(message.write())
  }

  async encryptTextWithPassword(text: string, password: string): Promise<Uint8Array> {
    const message = await createMessage({ text })
    const encrypted = await encrypt({
      message, // input as Message object
      passwords: [password], // multiple passwords possible
      config: { preferredCompressionAlgorithm: enums.compression.zlib },
      format: 'binary'
    })

    return encrypted
  }

  async decryptTextWithPassword(encryptedText: Uint8Array, password: string): Promise<string> {
    const encryptedMessage = await readMessage({
      binaryMessage: encryptedText // parse encrypted bytes
    })
    const { data: decrypted } = await decrypt({
      message: encryptedMessage,
      passwords: [password] // decrypt with password
    })
    console.log('decrypted', decrypted) // Text

    return decrypted
  }

  async encryptTextWithArmoredPublicKey(text: string, publicKeyArmored: string) {
    const publicKey = await readKey({ armoredKey: publicKeyArmored })

    const encrypted = await encrypt({
      message: await createMessage({ text }), // input as Message object
      encryptionKeys: publicKey,
      config: { preferredCompressionAlgorithm: enums.compression.zlib }
      // signingKeys: privateKey // optional
    })
    console.log(encrypted) // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
  }

  async decryptTextWithArmoredPrivateKey(encryptedText: string, privateKeyArmored: string, privateKeyPassphrase: string) {
    const privateKey = await decryptKey({
      privateKey: await readPrivateKey({ armoredKey: privateKeyArmored }),
      passphrase: privateKeyPassphrase
    })

    const message = await readMessage({
      armoredMessage: encryptedText // parse armored message
    })
    const { data: decrypted, signatures } = await decrypt({
      message,
      decryptionKeys: privateKey
      // expectSigned: true,
      // verificationKeys: publicKey, // optional
    })
    console.log(decrypted) // 'Hello, World!'
    // check signature validity (signed messages only)
    try {
      await signatures[0].verified // throws on invalid signature
      console.log('Signature is valid')
    } catch (e) {
      throw new Error('Signature could not be verified: ' + e.message)
    }
  }

  // async signWithArmoredPrivateKey(text: string) {
  //   const passphrase = `yourPassphrase` // what the private key is encrypted with

  //   const publicKey = await readKey({ armoredKey: publicKeyArmored })

  //   const privateKey = await decryptKey({
  //     privateKey: await readPrivateKey({ armoredKey: privateKeyArmored }),
  //     passphrase
  //   })

  //   const unsignedMessage = await createCleartextMessage({ text })
  //   const cleartextMessage = await sign({
  //     message: unsignedMessage, // CleartextMessage or Message object
  //     signingKeys: privateKey
  //   })
  //   console.log(cleartextMessage) // '-----BEGIN PGP SIGNED MESSAGE ... END PGP SIGNATURE-----'

  //   const signedMessage = await readCleartextMessage({
  //     cleartextMessage // parse armored message
  //   })
  //   const verificationResult = await verify({
  //     message: signedMessage as any, // TODO: Why does this fail?
  //     verificationKeys: publicKey
  //     // expectSigned: true
  //   })
  //   const { verified, keyID } = verificationResult.signatures[0]
  //   try {
  //     await verified // throws on invalid signature
  //     console.log('Signed by key id ' + keyID.toHex())
  //   } catch (e) {
  //     throw new Error('Signature could not be verified: ' + e.message)
  //   }
  // }

  // async signDetached() {
  //   ;(async () => {
  //     const publicKeyArmored = `-----BEGIN PGP PUBLIC KEY BLOCK-----
  // ...
  // -----END PGP PUBLIC KEY BLOCK-----`
  //     const privateKeyArmored = `-----BEGIN PGP PRIVATE KEY BLOCK-----
  // ...
  // -----END PGP PRIVATE KEY BLOCK-----` // encrypted private key
  //     const passphrase = `yourPassphrase` // what the private key is encrypted with

  //     const publicKey = await readKey({ armoredKey: publicKeyArmored })

  //     const privateKey = await decryptKey({
  //       privateKey: await readPrivateKey({ armoredKey: privateKeyArmored }),
  //       passphrase
  //     })

  //     const message = await createMessage({ text: 'Hello, World!' })
  //     const detachedSignature = await sign({
  //       message, // Message object
  //       signingKeys: privateKey,
  //       detached: true
  //     })
  //     console.log(detachedSignature)

  //     const signature = await readSignature({
  //       armoredSignature: detachedSignature // parse detached signature
  //     })
  //     const verificationResult = await verify({
  //       message, // Message object
  //       signature,
  //       verificationKeys: publicKey
  //       // expectSigned: true
  //     })
  //     const { verified, keyID } = verificationResult.signatures[0]
  //     try {
  //       await verified // throws on invalid signature
  //       console.log('Signed by key id ' + keyID.toHex())
  //     } catch (e) {
  //       throw new Error('Signature could not be verified: ' + e.message)
  //     }
  //   })()
  // }
}
