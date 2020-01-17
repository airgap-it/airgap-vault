import { Injectable, NgZone } from '@angular/core'
import { Platform } from '@ionic/angular'
import { Plugins, PluginListenerHandle, MotionEventResult } from '@capacitor/core'
import { Observable, Subscription } from 'rxjs'
import { auditTime } from 'rxjs/operators'

import entropyCalculatorWorkerJS from '../../../assets/workers/entropyCalculatorWorker'
import { Entropy, IEntropyGenerator } from '../entropy/IEntropyGenerator'

import { GyroscopeService } from './gyroscope.factory'
const blobURL: string = window.URL.createObjectURL(new Blob([entropyCalculatorWorkerJS]))
const entropyCalculatorWorker: Worker = new Worker(blobURL)

const { Motion } = Plugins

@Injectable({
  providedIn: 'root'
})
export class GyroscopeNativeService implements GyroscopeService, IEntropyGenerator {
  private collectedEntropyPercentage: number = 0

  private accelListenerHandle: PluginListenerHandle
  private accelSubscription: Subscription

  private entropyObservable: Observable<Entropy>

  constructor(private readonly platform: Platform, private readonly zone: NgZone) {}

  public start(): Promise<void> {
    this.collectedEntropyPercentage = 0

    return new Promise(async resolve => {
      await this.platform.ready()
      this.entropyObservable = new Observable(observer => {
        entropyCalculatorWorker.onmessage = event => {
          this.collectedEntropyPercentage += event.data.entropyMeasure
          observer.next({
            entropyHex: event.data.entropyHex
          })
        }

        this.accelSubscription = this.getAccelObservable()
          .pipe(auditTime(500))
          .subscribe((event: MotionEventResult) => {
            const entropyBuffer = this.arrayBufferFromIntArray([event.acceleration.x, event.acceleration.y, event.acceleration.z])
            entropyCalculatorWorker.postMessage({ entropyBuffer }, [entropyBuffer])
          })
      })
      resolve()
    })
  }

  public stop(): Promise<void> {
    this.accelListenerHandle.remove()
    this.accelSubscription.unsubscribe()

    return Promise.resolve()
  }

  public getEntropyUpdateObservable(): Observable<Entropy> {
    return this.entropyObservable
  }

  private getAccelObservable(): Observable<MotionEventResult> {
    return new Observable<MotionEventResult>(observer => {
        this.accelListenerHandle = Motion.addListener('accel', (event: MotionEventResult) => {
          this.zone.run(() => {
            observer.next(event)
          })
        })
    })
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
