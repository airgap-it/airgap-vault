import { Platform } from 'ionic-angular'
import { GyroscopeNativeService } from './gyroscope.native.service'
import { IEntropyGenerator } from '../entropy/IEntropyGenerator'
import { DeviceMotion } from '@ionic-native/device-motion'
import { DummyEntropyService } from '../entropy/dummy.entropy.service'

export interface GyroscopeService {
}

export function GyroscopeServiceFactory(platform: Platform, deviceMotion: DeviceMotion): IEntropyGenerator {
  if (platform.is('cordova')) {
    return new GyroscopeNativeService(platform, deviceMotion)
  } else {
    return new DummyEntropyService()
  }
}
