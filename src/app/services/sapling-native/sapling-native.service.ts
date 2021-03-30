import { TezosSaplingExternalMethodProvider, TezosSaplingTransaction } from '@airgap/coinlib-core'
import { SaplingPartialOutputDescription, SaplingUnsignedSpendDescription } from '@airgap/sapling-wasm'
import { Inject, Injectable } from '@angular/core'
import { Platform } from '@ionic/angular'

import { SAPLING_PLUGIN } from '../..//capacitor-plugins/injection-tokens'
import { SaplingPlugin } from '../../capacitor-plugins/definitions'

@Injectable({
  providedIn: 'root'
})
export class SaplingNativeService {
  constructor(@Inject(SAPLING_PLUGIN) private readonly sapling: SaplingPlugin, private readonly platform: Platform) {}

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

  private initParameters(saplingPlugin: SaplingPlugin): TezosSaplingExternalMethodProvider['initParameters'] {
    return async (_spendParams: Buffer, _outputParams: Buffer): Promise<void> => {
      return saplingPlugin.initParameters()
    }
  }

  private withProvingContext(saplingPlugin: SaplingPlugin): TezosSaplingExternalMethodProvider['withProvingContext'] {
    return async (action: (context: number) => Promise<TezosSaplingTransaction>): Promise<TezosSaplingTransaction> => {
      const { context } = await saplingPlugin.initProvingContext()
      const transaction = await action(parseInt(context))
      await saplingPlugin.dropProvingContext({ context })

      return transaction
    }
  }

  private prepareSpendDescription(saplingPlugin: SaplingPlugin): TezosSaplingExternalMethodProvider['prepareSpendDescription'] {
    return async (
      context: number,
      spendingKey: Buffer,
      address: Buffer,
      rcm: string,
      ar: Buffer,
      value: string,
      root: string,
      merklePath: string
    ): Promise<SaplingUnsignedSpendDescription> => {
      const { spendDescription: spendDescriptionHex } = await saplingPlugin.prepareSpendDescription({
        context: context.toString(),
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
    saplingPlugin: SaplingPlugin
  ): TezosSaplingExternalMethodProvider['preparePartialOutputDescription'] {
    return async (context: number, address: Buffer, rcm: Buffer, esk: Buffer, value: string): Promise<SaplingPartialOutputDescription> => {
      const { outputDescription: outputDescriptionHex } = await saplingPlugin.preparePartialOutputDescription({
        context: context.toString(),
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

  private createBindingSignature(saplingPlugin: SaplingPlugin): TezosSaplingExternalMethodProvider['createBindingSignature'] {
    return async (context: number, balance: string, sighash: Buffer): Promise<Buffer> => {
      const { bindingSignature } = await saplingPlugin.createBindingSignature({
        context: context.toString(),
        balance,
        sighash: sighash.toString('hex')
      })

      return Buffer.from(bindingSignature, 'hex')
    }
  }
}
