import { Platform } from '@ionic/angular'
import { DeviceMotion } from '@ionic-native/device-motion/ngx'

import { DummyEntropyService } from '../entropy/dummy.entropy.service'
import { IEntropyGenerator } from '../entropy/IEntropyGenerator'

import { GyroscopeNativeService } from './gyroscope.native.service'

export interface GyroscopeService {}

export function GyroscopeServiceFactory(platform: Platform, deviceMotion: DeviceMotion): IEntropyGenerator {
  if (platform.is('hybrid')) {
    return new GyroscopeNativeService(platform, deviceMotion)
  } else {
    return new DummyEntropyService()
  }
}
