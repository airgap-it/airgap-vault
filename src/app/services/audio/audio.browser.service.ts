import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'

import workerJS from '../../../assets/workers/entropyCalculatorWorker'
import { Entropy, IEntropyGenerator } from '../entropy/IEntropyGenerator'
const blobURL = window.URL.createObjectURL(new Blob([workerJS]))
const entropyCalculatorWorker = new Worker(blobURL)

@Injectable({ providedIn: 'root' })
export class AudioBrowserService implements IEntropyGenerator {
  private readonly ENTROPY_SIZE = 4096

  private handler

  private readonly entropyObservable: Observable<Entropy>

  private collectedEntropyPercentage: number = 0

  private readonly microphoneStreamSource
  private readonly scriptProcessor

  constructor() {
    this.entropyObservable = Observable.create(observer => {
      entropyCalculatorWorker.onmessage = event => {
        this.collectedEntropyPercentage += event.data.entropyMeasure
        observer.next({
          entropyHex: event.data.entropyHex
        })
      }
      this.handler = event => {
        const data = event.inputBuffer.getChannelData(0)
        const buffer1 = this.arrayBufferFromIntArray(data)
        entropyCalculatorWorker.postMessage({ entropyBuffer: buffer1 }, [buffer1])
      }
    })

    // polyfill getUserMedia
    navigator.getUserMedia =
      (navigator as any).getUserMedia ||
      (navigator as any).webkitGetUserMedia ||
      (navigator as any).mozGetUserMedia ||
      (navigator as any).msGetUserMedia
  }

  public start(): Promise<void> {
    this.collectedEntropyPercentage = 0

    return new Promise(resolve => {
      navigator.getUserMedia(
        { video: false, audio: true },
        stream => {
          const audioContext = new AudioContext()
          const microphoneStreamSource = audioContext.createMediaStreamSource(stream)
          const scriptProcessor = audioContext.createScriptProcessor(this.ENTROPY_SIZE, 1, 1)
          scriptProcessor.onaudioprocess = event => {
            this.handler(event)
          }
          microphoneStreamSource.connect(scriptProcessor)
          scriptProcessor.connect(audioContext.destination)
          resolve()
        },
        err => {
          console.log('error in audio.browser.service:', err)
          resolve()
        }
      )
    })
  }

  public stop(): Promise<any> {
    return new Promise(resolve => {
      if (this.microphoneStreamSource) {
        this.microphoneStreamSource.stop()
        this.microphoneStreamSource.disconnect()
      }
      if (this.scriptProcessor) {
        this.scriptProcessor.stop()
        this.scriptProcessor.disconnect()
      }
      resolve()
    })
  }

  public getEntropyUpdateObservable(): Observable<Entropy> {
    return this.entropyObservable
  }

  private arrayBufferFromIntArray(array: Float32Array) {
    const buffer = new ArrayBuffer(array.length)
    const bufView = new Float32Array(buffer)

    for (let i = 0; i < array.length; i++) {
      bufView[i] = array[i]
    }

    return buffer
  }

  public getCollectedEntropyPercentage(): number {
    return this.collectedEntropyPercentage / 200
  }
}
