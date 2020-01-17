import { Platform } from '@ionic/angular'

import { DummyEntropyService } from '../entropy/dummy.entropy.service'
import { IEntropyGenerator } from '../entropy/IEntropyGenerator'

import { GyroscopeNativeService } from './gyroscope.native.service'
import { NgZone } from '@angular/core'

export interface GyroscopeService {}

export function GyroscopeServiceFactory(platform: Platform, zone: NgZone): IEntropyGenerator {
  if (platform.is('hybrid')) {
    return new GyroscopeNativeService(platform, zone)
  } else {
    return new DummyEntropyService()
  }
}
