import { ElementRef, Injectable, NgZone, Renderer2, RendererFactory2, ViewChild } from '@angular/core'
import { CameraPreview } from '@ionic-native/camera-preview'
import { Platform } from 'ionic-angular'
import { Entropy, IEntropyGenerator } from '../entropy/IEntropyGenerator'
import { Observable } from 'rxjs'

const workerJS = require('../../assets/workers/entropyCalculatorWorker.js')
const blobURL = window.URL.createObjectURL(new Blob([workerJS]))
const entropyCalculatorWorker = new Worker(blobURL)

@Injectable()
export class CameraNativeService implements IEntropyGenerator {

  private disabled = false

  private cameraIsRunning = false // Prevent multiple start/stops of camera
  private cameraIsTakingPhoto = false // Prevent stopping camera while picture is being taken

  // entropy settings
  private VIDEO_SIZE = 50
  private VIDEO_QUALITY = 100
  private VIDEO_FREQUENCY = 2000

  private renderer: Renderer2

  @ViewChild('cameraCanvas') public cameraCanvas: ElementRef
  canvasElement = HTMLCanvasElement

  private collectedEntropyPercentage: number = 0

  private handler: Function
  private entropyObservable: Observable<Entropy>

  private cameraInterval: number

  private cameraOptions: any

  constructor(private platform: Platform, private cameraPreview: CameraPreview, private rendererFactory: RendererFactory2, private ngZone: NgZone) {
    this.renderer = rendererFactory.createRenderer(null, null)
    this.entropyObservable = Observable.create(observer => {
      this.handler = (base64ImagePayload) => {
        const buffer1 = this.arrayBufferFromBase64(base64ImagePayload)

        entropyCalculatorWorker.onmessage = (event) => {
          this.collectedEntropyPercentage += event.data.entropyMeasure
          observer.next({ entropyHex: event.data.entropyHex })
        }

        entropyCalculatorWorker.postMessage({
          entropyBuffer: buffer1
        }, [buffer1])
      }
    })
  }

  setCameraOptions(opts) {
    this.cameraOptions = opts
  }

  viewDidLeave() {
    this.disabled = true
    this.uninjectCSS()
  }

  viewWillEnter() {
    this.disabled = false
  }

  start(): Promise<void> {
    this.disabled = false
    this.collectedEntropyPercentage = 0
    return new Promise((resolve, reject) => {
      this.platform.ready().then(() => {
        resolve(this.initCamera())
      })
    })
  }

  private initCamera(): Promise<void> {
    console.log('initCamera')

    return new Promise((resolve, reject) => {
      this.cameraPreview.startCamera(Object.assign({
        x: 0,
        y: 0,
        width: window.screen.width,
        height: window.screen.height,
        toBack: true,
        tapPhoto: false,
        previewDrag: false,
        disableExifHeaderStripping: true
      } as any, this.cameraOptions)).then(() => {
        this.cameraIsRunning = true
        if (this.platform.is('ios')) {
          return this.cameraPreview.setFlashMode('off')
        }
        return Promise.resolve()
      }).then(() => {
        if (this.disabled) {
          console.log('not starting, disabled')
          if (this.cameraIsRunning) {
            this.stop()
          }
          return
        }
        console.log('camera started.')

        // inject css now
        this.injectCSS()

        // start camera interval
        this.cameraInterval = window.setInterval(() => {
          this.cameraIsTakingPhoto = true
          this.cameraPreview.takePicture({
            width: this.VIDEO_SIZE,
            height: this.VIDEO_SIZE,
            quality: this.VIDEO_QUALITY
          }).then(result => {
            this.cameraIsTakingPhoto = false
            if (this.handler) {
              this.handler(result)
            }
          }).catch(err => {
            if (err === 'Camera not started') {
              if (this.cameraInterval) {
                clearInterval(this.cameraInterval)
              }
            }
          })
        }, this.VIDEO_FREQUENCY)

        resolve()
      }, error => {
        console.warn('startCamera error: ', error)
        if (error === 'Camera already started!') {
          this.stop().then(() => {
            return this.initCamera()
          })
        }
      })
    })
  }

  stop(): Promise<any> {
    if (!this.cameraIsRunning) {
      console.log('CAMERA ALREADY STOPPED, ABORTING')
      this.uninjectCSS()
      return Promise.reject(null)
    }
    // We need to delay the stopCamera call because it crashes on iOS
    // if it is called while taking a photo
    if (this.cameraIsTakingPhoto) {
      this.uninjectCSS()
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log('CAMERA IS TAKING PHOTO, DELAYING')
          return this.stop()
        }, 200)
      })
    }
    this.uninjectCSS()
    if (this.cameraInterval) {
      clearInterval(this.cameraInterval)
    }
    return new Promise((resolve, reject) => {
      this.cameraPreview.stopCamera().then(() => {
        this.cameraIsRunning = false
        console.log('camera stopped.')
      }, error => {
        console.log('camera could not be stopped.')
        reject(error)
      })
    })
  }

  getEntropyUpdateObservable(): Observable<Entropy> {
    return this.entropyObservable
  }

  private arrayBufferFromBase64(base64: string) {
    const raw = window.atob(base64)
    const buffer = new ArrayBuffer(raw.length * 2)
    const bufView = new Uint8Array(buffer)

    for (let i = 0; i < raw.length; i++) {
      bufView[i] = raw.charCodeAt(i)
    }

    return buffer
  }

  private injectCSS() {
    // inject css to html, body, .ion-app, ion-content
    this.renderer.addClass(document.body, 'transparent-bg')
  }

  private uninjectCSS() {
    // removes injected css
    this.renderer.removeClass(document.body, 'transparent-bg')
  }

  getCollectedEntropyPercentage(): number {
    return this.collectedEntropyPercentage / 10
  }

}
