import { SaplingPartialOutputDescription, SaplingUnsignedSpendDescription } from '@airgap/sapling-wasm'
import { TezosSaplingExternalMethodProvider, TezosSaplingTransaction } from '@airgap/tezos'
import { Inject, Injectable } from '@angular/core'
import { Platform } from '@ionic/angular'

import { SAPLING_PLUGIN } from '../..//capacitor-plugins/injection-tokens'
import { SaplingNativePlugin } from '../../capacitor-plugins/definitions'

@Injectable({
  providedIn: 'root'
})
export class SaplingNativeService {
  constructor(@Inject(SAPLING_PLUGIN) private readonly sapling: SaplingNativePlugin, private readonly platform: Platform) {}

  public async createExternalMethodProvider(): Promise<TezosSaplingExternalMethodProvider | undefined> {
    const isSupported = this.platform.is('capacitor') && !this.platform.is('electron') && (await this.sapling.isSupported()).isSupported

    return isSupported
      ? {
          initParameters: this.initParameters(this.sapling),
          withProvingContext: this.withProvingContext(this.sapling),
          prepareSpendDescription: this.prepareSpendDescription(this.sapling),
          preparePartialOutputDescription: this.preparePartialOutputDescription(this.sapling),
          createBindingSignature: this.createBindingSignature(this.sapling)
        }
      : undefined
  }

  private initParameters(saplingPlugin: SaplingNativePlugin): TezosSaplingExternalMethodProvider['initParameters'] {
    return async (_spendParams: Buffer, _outputParams: Buffer): Promise<void> => {
      return saplingPlugin.initParameters()
    }
  }

  private withProvingContext(saplingPlugin: SaplingNativePlugin): TezosSaplingExternalMethodProvider['withProvingContext'] {
    return async (action: (context: string) => Promise<TezosSaplingTransaction>): Promise<TezosSaplingTransaction> => {
      const { context } = await saplingPlugin.initProvingContext()
      const transaction = await action(context)
      await saplingPlugin.dropProvingContext({ context })

      return transaction
    }
  }

  private prepareSpendDescription(saplingPlugin: SaplingNativePlugin): TezosSaplingExternalMethodProvider['prepareSpendDescription'] {
    return async (
      context: string,
      spendingKey: Buffer,
      address: Buffer,
      rcm: string,
      ar: Buffer,
      value: string,
      root: string,
      merklePath: string
    ): Promise<SaplingUnsignedSpendDescription> => {
      const { spendDescription: spendDescriptionHex } = await saplingPlugin.prepareSpendDescription({
        context: context,
        spendingKey: spendingKey.toString('hex'),
        address: address.toString('hex'),
        rcm,
        ar: ar.toString('hex'),
        value,
        root,
        merklePath
      })

      const spendDescription: Buffer = Buffer.from(spendDescriptionHex, 'hex')

      return {
        cv: spendDescription.slice(0, 32) /* 32 bytes */,
        rt: spendDescription.slice(32, 64) /* 32 bytes */,
        nf: spendDescription.slice(64, 96) /* 32 bytes */,
        rk: spendDescription.slice(96, 128) /* 32 bytes */,
        proof: spendDescription.slice(128, 320) /* 48 + 96 + 48 bytes */
      }
    }
  }

  private preparePartialOutputDescription(
    saplingPlugin: SaplingNativePlugin
  ): TezosSaplingExternalMethodProvider['preparePartialOutputDescription'] {
    return async (context: string, address: Buffer, rcm: Buffer, esk: Buffer, value: string): Promise<SaplingPartialOutputDescription> => {
      const { outputDescription: outputDescriptionHex } = await saplingPlugin.preparePartialOutputDescription({
        context: context,
        address: address.toString('hex'),
        rcm: rcm.toString('hex'),
        esk: esk.toString('hex'),
        value
      })

      const outputDescription: Buffer = Buffer.from(outputDescriptionHex, 'hex')

      return {
        cv: outputDescription.slice(0, 32) /* 32 bytes */,
        cm: outputDescription.slice(32, 64) /* 32 bytes */,
        proof: outputDescription.slice(64, 256) /* 48 + 96 + 48 bytes */
      }
    }
  }

  private createBindingSignature(saplingPlugin: SaplingNativePlugin): TezosSaplingExternalMethodProvider['createBindingSignature'] {
    return async (context: string, balance: string, sighash: Buffer): Promise<Buffer> => {
      const { bindingSignature } = await saplingPlugin.createBindingSignature({
        context: context,
        balance,
        sighash: sighash.toString('hex')
      })

      return Buffer.from(bindingSignature, 'hex')
    }
  }
}
