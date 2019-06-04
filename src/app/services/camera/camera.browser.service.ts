import { ElementRef, Injectable, ViewChild } from '@angular/core'
import { Entropy, IEntropyGenerator } from '../entropy/IEntropyGenerator'
import { Observable } from 'rxjs'

import workerJS from '../../../assets/workers/entropyCalculatorWorker'
const blobURL = window.URL.createObjectURL(new Blob([workerJS]))
const entropyCalculatorWorker = new Worker(blobURL)

@Injectable({ providedIn: 'root' })
export class CameraBrowserService implements IEntropyGenerator {
  private VIDEO_FREQUENCY = 2000

  @ViewChild('cameraCanvas') public cameraCanvas: ElementRef
  canvasElement: HTMLCanvasElement

  private collectedEntropyPercentage: number = 0

  private handler: Function
  private entropyObservable: Observable<Entropy>

  private cameraInterval: number

  private videoElement: any
  private videoStream: any

  constructor() {
    this.entropyObservable = Observable.create(observer => {
      entropyCalculatorWorker.onmessage = event => {
        this.collectedEntropyPercentage += event.data.entropyMeasure
        observer.next({ entropyHex: event.data.entropyHex })
      }
      this.handler = buffer1 => {
        const uintArray = this.arrayBufferFromUint8Array(buffer1)
        entropyCalculatorWorker.postMessage(
          {
            entropyBuffer: uintArray
          },
          [uintArray]
        )
      }
    })
  }

  viewDidLeave() {
    // empty
  }

  viewWillEnter() {
    // empty
  }

  start(): Promise<void> {
    return new Promise(resolve => {
      const constraints = {
        video: true,
        audio: true
      }

      this.collectedEntropyPercentage = 0

      const video = this.videoElement.nativeElement

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => {
          this.videoStream = stream
          video.srcObject = stream
          video.play()
          resolve()
        })
        .catch(err => {
          console.log('error in camera.brower.service', err)
          resolve()
        })

      this.cameraInterval = window.setInterval(() => {
        if (video.videoWidth === 0) {
          return
        }
        let canvas = document.createElement('canvas')

        let context = canvas.getContext('2d')

        context.drawImage(video, 0, 0)
        let buffer = context.getImageData(0, 0, video.videoWidth, video.videoHeight).data
        this.handler(buffer)
      }, this.VIDEO_FREQUENCY / 5)
    })
  }

  stop(): Promise<any> {
    if (this.cameraInterval) {
      clearInterval(this.cameraInterval)
    }

    try {
      this.videoStream.getTracks().forEach(function(track) {
        track.stop()
      })
    } catch (e) {
      console.log(e)
    }
    return Promise.resolve()
  }

  getEntropyUpdateObservable(): Observable<Entropy> {
    return this.entropyObservable
  }

  getCollectedEntropyPercentage(): number {
    return this.collectedEntropyPercentage
  }

  private arrayBufferFromUint8Array(uintArray: Uint8ClampedArray) {
    const buffer = new ArrayBuffer(uintArray.length)
    const bufView = new Uint8Array(buffer)

    for (let i = 0; i < uintArray.length; i++) {
      bufView[i] = uintArray[i]
    }

    return buffer
  }

  setVideoElement(element) {
    this.videoElement = element
  }
}
