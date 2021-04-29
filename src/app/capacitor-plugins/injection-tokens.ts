import { InjectionToken } from '@angular/core'
import { CameraPreviewPlugin, SaplingPlugin, SecurityUtilsPlugin } from './definitions'

export const CAMERA_PREVIEW_PLUGIN = new InjectionToken<CameraPreviewPlugin>('CameraPreviewPlugin')
export const SAPLING_PLUGIN = new InjectionToken<SaplingPlugin>('SaplingPlugin')
export const SECURITY_UTILS_PLUGIN = new InjectionToken<SecurityUtilsPlugin>('SecurityUtilsPlugin')
