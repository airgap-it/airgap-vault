import { ICoinProtocol } from '@airgap/coinlib-core'
import { ProtocolOptions } from '@airgap/coinlib-core/utils/ProtocolOptions'
import { PluginListenerHandle, registerPlugin } from '@capacitor/core'

export interface CameraPreviewPlugin {
  start({}): Promise<void>
  stop(): Promise<void>
  capture({}): Promise<{ value: string }>
}

export const CameraPreview: CameraPreviewPlugin = registerPlugin('CameraPreview')

export interface SaplingNativePlugin {
  isSupported(): Promise<{ isSupported: boolean }>
  initParameters(): Promise<void>
  initProvingContext(): Promise<{ context: string }>
  dropProvingContext(params: { context: string }): Promise<void>
  prepareSpendDescription(params: {
    context: string
    spendingKey: string
    address: string
    rcm: string
    ar: string
    value: string
    root: string
    merklePath: string
  }): Promise<{ spendDescription: string }>
  preparePartialOutputDescription(params: {
    context: string
    address: string
    rcm: string
    esk: string
    value: string
  }): Promise<{ outputDescription: string }>
  createBindingSignature(params: { context: string; balance: string; sighash: string }): Promise<{ bindingSignature: string }>
}

export const SaplingNative: SaplingNativePlugin = registerPlugin('SaplingNative')

export interface SecurityUtilsPlugin {
  waitForOverlayDismiss(): Promise<void>
  assessDeviceIntegrity(): Promise<{ value: boolean }>
  authenticate(): Promise<void>
  setInvalidationTimeout({}): Promise<void>
  invalidate(): Promise<void>
  toggleAutomaticAuthentication({}): Promise<void>
  setAuthenticationReason({}): Promise<void>
  initStorage({}): Promise<void>
  isDeviceSecure({}): Promise<{ value: boolean }>
  secureDevice({}): Promise<void>
  getItem({}): Promise<{ value: string }>
  setItem({}): Promise<void>
  setupRecoveryPassword({}): Promise<{ recoveryKey: string }>
  removeItem({}): Promise<void>
  removeAll({}): Promise<void>
  destroy(): Promise<void>
  setWindowSecureFlag(): Promise<void>
  clearWindowSecureFlag(): Promise<void>
  addListener(event: string, callback: Function): PluginListenerHandle
}

export const SecurityUtils: SecurityUtilsPlugin = registerPlugin('SecurityUtils')

export interface IsolatedProtocolPlugin {
  getField(params: { 
    identifier: string,
    options?: ProtocolOptions,
    key: keyof ICoinProtocol
  }): Promise<{ result: unknown }>
  
  callMethod(params: {
    identifier: string,
    options?: ProtocolOptions,
    key: keyof ICoinProtocol,
    args?: unknown[] 
  }): Promise<{ result: unknown }>
}

export const IsolatedProtocol: IsolatedProtocolPlugin = registerPlugin('IsolatedProtocol')