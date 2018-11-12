import { Injectable } from '@angular/core'
import { Entropy, IEntropyGenerator } from '../entropy/IEntropyGenerator'
import { Observable } from 'rxjs'

import workerJS from '../../assets/workers/entropyCalculatorWorker'
const blobURL = window.URL.createObjectURL(new Blob([workerJS]))
const entropyCalculatorWorker = new Worker(blobURL)

@Injectable()
export class AudioBrowserService implements IEntropyGenerator {

  private ENTROPY_SIZE = 4096

  private handler

  private entropyObservable: Observable<Entropy>

  private collectedEntropyPercentage: number = 0

  private microphoneStreamSource
  private scriptProcessor

  constructor() {
    this.entropyObservable = Observable.create(observer => {
      entropyCalculatorWorker.onmessage = (event) => {
        this.collectedEntropyPercentage += event.data.entropyMeasure
        observer.next({
          entropyHex: event.data.entropyHex
        })
      }
      this.handler = (event) => {
        const data = event.inputBuffer.getChannelData(0)
        let buffer1 = this.arrayBufferFromIntArray(data)
        entropyCalculatorWorker.postMessage({ entropyBuffer: buffer1 }, [buffer1])
      }
    })

    // polyfill getUserMedia
    navigator.getUserMedia = (
      (navigator as any).getUserMedia ||
      (navigator as any).webkitGetUserMedia ||
      (navigator as any).mozGetUserMedia ||
      (navigator as any).msGetUserMedia
    )
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia({ video: false, audio: true }, (stream) => {
        const audioContext = new AudioContext()
        const microphoneStreamSource = audioContext.createMediaStreamSource(stream)
        const scriptProcessor = audioContext.createScriptProcessor(this.ENTROPY_SIZE, 1, 1)
        scriptProcessor.onaudioprocess = (event) => {
          this.handler(event)
        }
        microphoneStreamSource.connect(scriptProcessor)
        scriptProcessor.connect(audioContext.destination)
        resolve()
      }, () => {
        reject()
      })
    })
  }

  stop(): Promise<any> {
    return new Promise((resolve, reject) => {
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

  getEntropyUpdateObservable(): Observable<Entropy> {
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

  getCollectedEntropyPercentage(): number {
    return this.collectedEntropyPercentage / 200
  }

}
