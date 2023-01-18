import { InjectionToken } from '@angular/core'
import { FilePickerPlugin } from '@capawesome/capacitor-file-picker'
import { CameraPreviewPlugin, IsolatedProtocolPlugin, SaplingNativePlugin, SecurityUtilsPlugin, ZipPlugin } from './definitions'

export const CAMERA_PREVIEW_PLUGIN = new InjectionToken<CameraPreviewPlugin>('CameraPreviewPlugin')
export const SAPLING_PLUGIN = new InjectionToken<SaplingNativePlugin>('SaplingPlugin')
export const SECURITY_UTILS_PLUGIN = new InjectionToken<SecurityUtilsPlugin>('SecurityUtilsPlugin')
export const ISOLATED_PROTOCOL_PLUGIN = new InjectionToken<IsolatedProtocolPlugin>('IsolatedProtocolPlugin')
export const ZIP_PLUGIN = new InjectionToken<ZipPlugin>('ZipPlugin')
export const FILE_PICKER_PLUGIN = new InjectionToken<FilePickerPlugin>('FilePickerPlugin')