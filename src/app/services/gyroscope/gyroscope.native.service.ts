import { Injectable } from '@angular/core'
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion/ngx'
import { Platform } from '@ionic/angular'
import { Observable, Subscription } from 'rxjs'

import entropyCalculatorWorkerJS from '../../../assets/workers/entropyCalculatorWorker'
import { Entropy, IEntropyGenerator } from '../entropy/IEntropyGenerator'

import { GyroscopeService } from './gyroscope.factory'
const blobURL: string = window.URL.createObjectURL(new Blob([entropyCalculatorWorkerJS]))
const entropyCalculatorWorker: Worker = new Worker(blobURL)

@Injectable({
  providedIn: 'root'
})
export class GyroscopeNativeService implements GyroscopeService, IEntropyGenerator {
  private collectedEntropyPercentage: number = 0

  private gyroSubscription: Subscription

  private entropyObservable: Observable<Entropy>

  constructor(private readonly platform: Platform, private readonly deviceMotion: DeviceMotion) {}

  public start(): Promise<void> {
    this.collectedEntropyPercentage = 0

    return new Promise(async (resolve) => {
      await this.platform.ready()
      this.entropyObservable = new Observable((observer) => {
        entropyCalculatorWorker.onmessage = (event) => {
          this.collectedEntropyPercentage += event.data.entropyMeasure
          observer.next({
            entropyHex: event.data.entropyHex
          })
        }

        this.gyroSubscription = this.deviceMotion
          .watchAcceleration({ frequency: 500 })
          .subscribe((acceleration: DeviceMotionAccelerationData) => {
            const entropyBuffer = this.arrayBufferFromIntArray([acceleration.x, acceleration.y, acceleration.z])
            entropyCalculatorWorker.postMessage({ entropyBuffer }, [entropyBuffer])
          })
      })
      resolve()
    })
  }

  public stop(): Promise<void> {
    this.gyroSubscription.unsubscribe()

    return Promise.resolve()
  }

  public getEntropyUpdateObservable(): Observable<Entropy> {
    return this.entropyObservable
  }

  private arrayBufferFromIntArray(array: number[]): ArrayBuffer {
    const buffer = new ArrayBuffer(array.length * 2)
    const bufView = new Uint8Array(buffer)

    for (let i = 0; i < array.length; i++) {
      bufView[i] = Math.abs(array[i] * 10000)
    }

    return buffer
  }

  public getCollectedEntropyPercentage(): number {
    return this.collectedEntropyPercentage / 25
  }
}
