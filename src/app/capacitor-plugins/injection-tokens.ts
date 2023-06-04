import { InjectionToken } from '@angular/core'
import { FilePickerPlugin } from '@capawesome/capacitor-file-picker'
import { CameraPreviewPlugin, EnvironmentPlugin, SaplingNativePlugin, SecurityUtilsPlugin } from './definitions'

export const CAMERA_PREVIEW_PLUGIN = new InjectionToken<CameraPreviewPlugin>('CameraPreviewPlugin')
export const SAPLING_PLUGIN = new InjectionToken<SaplingNativePlugin>('SaplingPlugin')
export const SECURITY_UTILS_PLUGIN = new InjectionToken<SecurityUtilsPlugin>('SecurityUtilsPlugin')
export const FILE_PICKER_PLUGIN = new InjectionToken<FilePickerPlugin>('FilePickerPlugin')
export const ENVIRONMENT_PLUGIN = new InjectionToken<EnvironmentPlugin>('EnvironmentPlugin')