import { InjectionToken } from '@angular/core'
import { CameraPreviewPlugin, SecurityUtilsPlugin } from './definitions'

export const CAMERA_PREVIEW_PLUGIN = new InjectionToken<CameraPreviewPlugin>('CameraPreviewPlugin')
export const SECURITY_UTILS_PLUGIN = new InjectionToken<SecurityUtilsPlugin>('SecurityUtilsPlugin')
