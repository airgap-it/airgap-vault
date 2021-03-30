import { PluginListenerHandle } from '@capacitor/core'

export interface CameraPreviewPlugin {
  start({}): Promise<void>
  stop(): Promise<void>
  capture({}): Promise<{ value: string }>
}

export interface SaplingPlugin {
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
