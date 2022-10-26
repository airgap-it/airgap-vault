import { InjectionToken } from '@angular/core'
import { CameraPreviewPlugin, IsolatedProtocolPlugin, SaplingNativePlugin, SecurityUtilsPlugin } from './definitions'

export const CAMERA_PREVIEW_PLUGIN = new InjectionToken<CameraPreviewPlugin>('CameraPreviewPlugin')
export const SAPLING_PLUGIN = new InjectionToken<SaplingNativePlugin>('SaplingPlugin')
export const SECURITY_UTILS_PLUGIN = new InjectionToken<SecurityUtilsPlugin>('SecurityUtilsPlugin')
export const ISOLATED_PROTOCOL_PLUGIN = new InjectionToken<IsolatedProtocolPlugin>('IsolatedProtocolPlugin')
