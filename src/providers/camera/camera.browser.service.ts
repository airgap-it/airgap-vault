import { ElementRef, Injectable, NgZone, Renderer2, RendererFactory2, ViewChild } from '@angular/core'
import { CameraPreview } from '@ionic-native/camera-preview'
import { Platform } from 'ionic-angular'
import { Entropy, IEntropyGenerator } from '../entropy/IEntropyGenerator'
import { Observable } from 'rxjs'

const entropyCalculatorWorker = new Worker('./assets/workers/entropyCalculatorWorker.js')

@Injectable()
export class CameraBrowserService implements IEntropyGenerator {

  private disabled = false

  private cameraIsRunning = false // Prevent multiple start/stops of camera
  private cameraIsTakingPhoto = false // Prevent stopping camera while picture is being taken

  // entropy settings
  private VIDEO_SIZE = 50
  private VIDEO_QUALITY = 100
  private VIDEO_FREQUENCY = 2000

  private renderer: Renderer2

  @ViewChild('cameraCanvas') public cameraCanvas: ElementRef
  canvasElement: HTMLCanvasElement

  private collectedEntropyPercentage: number = 0

  private handler: Function
  private entropyObservable: Observable<Entropy>

  private cameraInterval: number

  private cameraOptions: any

  private videoElement: any
  private videoStream: any

  constructor(private platform: Platform, private cameraPreview: CameraPreview, private rendererFactory: RendererFactory2, private ngZone: NgZone) {
    this.renderer = rendererFactory.createRenderer(null, null)
    this.entropyObservable = Observable.create(observer => {
      entropyCalculatorWorker.onmessage = (event) => {
        this.collectedEntropyPercentage += event.data.entropyMeasure
        observer.next({ entropyHex: event.data.entropyHex })
      }
      this.handler = (buffer1) => {
        const uintArray = this.arrayBufferFromUint8Array(buffer1)
        entropyCalculatorWorker.postMessage({
          entropyBuffer: uintArray
        }, [uintArray])
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
    return Promise.resolve()
  }

  private initCamera(): Promise<void> {
    return Promise.resolve()
  }

  stop(): Promise<any> {
    const video = this.videoElement.nativeElement
    if (this.cameraInterval) {
      clearInterval(this.cameraInterval)
    }

    try {
      this.videoStream.getTracks().forEach(function (track) { track.stop() })
    } catch (e) { console.error(e) }
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
    const constraints = {
      video: true,
      audio: true
    }
    this.videoElement = element
    const video = this.videoElement.nativeElement

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      this.videoStream = stream
      video.src = window.URL.createObjectURL(stream)
      video.play()
    }).catch(console.error)

    this.cameraInterval = window.setInterval(() => {
      if (video.videoWidth === 0) { return }
      let canvas = document.createElement('canvas')

      let context = canvas.getContext('2d')

      context.drawImage(video, 0, 0)
      let buffer = context.getImageData(0, 0, video.videoWidth, video.videoHeight).data
      this.handler(buffer)
    }, this.VIDEO_FREQUENCY / 5)

  }
}
