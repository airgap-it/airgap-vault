import { Injectable } from '@angular/core'
import { Entropy, IEntropyGenerator } from '../entropy/IEntropyGenerator'
import { Observable } from 'rxjs'

const workerJS = require('../../assets/workers/entropyCalculatorWorker.js')
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
      this.handler = (event) => {
        const data = (event as any).inputBuffer.getChannelData(0)
        const buffer1 = this.arrayBufferFromIntArray(data)

        entropyCalculatorWorker.onmessage = (event) => {
          this.collectedEntropyPercentage += event.data.entropyHex
          observer.next({ entropy: buffer1 })
        }

        entropyCalculatorWorker.postMessage({ entropyBuffer: buffer1 }, [buffer1])

        observer.next(data)
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
        this.microphoneStreamSource = audioContext.createMediaStreamSource(stream)
        this.scriptProcessor = audioContext.createScriptProcessor(this.ENTROPY_SIZE, 1, 1)
        this.scriptProcessor.onaudioprocess = this.handler
        this.microphoneStreamSource.connect(this.scriptProcessor)
        this.scriptProcessor.connect(audioContext.destination)
        resolve()
      }, () => {
        reject()
      })
    })
  }

  stop(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.microphoneStreamSource.disconnect()
      this.scriptProcessor.disconnect()
      resolve()
    })
  }

  getEntropyUpdateObservable(): Observable<Entropy> {
    return this.entropyObservable
  }

  private arrayBufferFromIntArray(array: number[]) {
    const buffer = new ArrayBuffer(array.length * 2)
    const bufView = new Uint8Array(buffer)

    for (let i = 0; i < array.length; i++) {
      bufView[i] = Math.abs(array[i] * 10000)
    }

    return buffer
  }

  getCollectedEntropyPercentage(): number {
    return this.collectedEntropyPercentage
  }

}
