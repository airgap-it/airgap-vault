import { ElementRef, Injectable, Renderer2, RendererFactory2, ViewChild } from '@angular/core'
import { Platform } from '@ionic/angular'
import { Observable } from 'rxjs'
import { Plugins } from '@capacitor/core'

import workerJS from '../../../assets/workers/entropyCalculatorWorker'
import { Entropy, IEntropyGenerator } from '../entropy/IEntropyGenerator'

import { ErrorCategory, handleErrorLocal } from './../error-handler/error-handler.service'
import { PermissionsService, PermissionStatus } from './../permissions/permissions.service'
const blobURL = window.URL.createObjectURL(new Blob([workerJS]))
const entropyCalculatorWorker = new Worker(blobURL)

const { CameraPreview } = Plugins

@Injectable({ providedIn: 'root' })
export class CameraNativeService implements IEntropyGenerator {
  private disabled = false

  private cameraIsRunning = false // Prevent multiple start/stops of camera
  private cameraIsTakingPhoto = false // Prevent stopping camera while picture is being taken

  // entropy settings
  private readonly VIDEO_SIZE = 50
  private readonly VIDEO_QUALITY = 100
  private readonly VIDEO_FREQUENCY = 2000

  private readonly renderer: Renderer2

  @ViewChild('cameraCanvas', { static: false }) public cameraCanvas: ElementRef
  public canvasElement: HTMLCanvasElement

  private collectedEntropyPercentage: number = 0

  private handler: Function
  private readonly entropyObservable: Observable<Entropy>

  private cameraInterval: number

  private cameraOptions: any

  constructor(
    private readonly platform: Platform,
    private readonly rendererFactory: RendererFactory2,
    private readonly permissionsService: PermissionsService
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null)
    this.entropyObservable = Observable.create(observer => {
      entropyCalculatorWorker.onmessage = event => {
        this.collectedEntropyPercentage += event.data.entropyMeasure
        observer.next({ entropyHex: event.data.entropyHex })
      }

      this.handler = base64ImagePayload => {
        const buffer1 = this.arrayBufferFromBase64(base64ImagePayload)

        entropyCalculatorWorker.postMessage(
          {
            entropyBuffer: buffer1
          },
          [buffer1]
        )
      }
    })
  }

  public setCameraOptions(opts) {
    this.cameraOptions = opts
  }

  public viewDidLeave() {
    this.disabled = true
    this.uninjectCSS()
  }

  public viewWillEnter() {
    this.disabled = false
  }

  public async start(): Promise<void> {
    this.disabled = false
    this.collectedEntropyPercentage = 0
    await this.platform.ready()

    const permissionStatus = await this.permissionsService.hasCameraPermission()
    if (permissionStatus !== PermissionStatus.GRANTED) {
      return
    }

    return this.initCamera()
  }

  private initCamera(): Promise<void> {
    console.log('initCamera')

    return new Promise(resolve => {
      CameraPreview
        .start(
          Object.assign(
            { 
              camera: 'front',
              disableExifHeaderStripping: true
            } as any, 
            this.cameraOptions)
        )
        .then(() => {
          this.cameraIsRunning = true
          return Promise.resolve()
        })
        .then(
          () => {
            if (this.disabled) {
              console.log('not starting, disabled')
              if (this.cameraIsRunning) {
                this.stop().catch(handleErrorLocal(ErrorCategory.CORDOVA_PLUGIN))
              }

              return
            }
            console.log('camera started.')

            // inject css now
            this.injectCSS()

            // start camera interval
            this.cameraInterval = window.setInterval(() => {
              this.cameraIsTakingPhoto = true
              CameraPreview
                .capture({
                  width: this.VIDEO_SIZE,
                  height: this.VIDEO_SIZE,
                  quality: this.VIDEO_QUALITY
                })
                .then(result => {
                  this.cameraIsTakingPhoto = false
                  if (this.handler) {
                    this.handler(result.value)
                  }
                })
                .catch(err => {
                  if (err === 'Camera not started') {
                    if (this.cameraInterval) {
                      clearInterval(this.cameraInterval)
                    }
                  }
                })
            }, this.VIDEO_FREQUENCY)

            resolve()
          },
          error => {
            console.warn('startCamera error: ', error)
            if (error === 'Camera already started!') {
              this.stop()
                .then(() => {
                  return this.initCamera()
                })
                .catch(handleErrorLocal(ErrorCategory.CORDOVA_PLUGIN))
            }
          }
        )
    })
  }

  public stop(): Promise<any> {
    if (!this.cameraIsRunning) {
      console.log('CAMERA ALREADY STOPPED, ABORTING')
      this.uninjectCSS()

      return Promise.reject(null)
    }
    // We need to delay the stopCamera call because it crashes on iOS
    // if it is called while taking a photo
    if (this.cameraIsTakingPhoto) {
      this.uninjectCSS()

      return new Promise(resolve => {
        setTimeout(() => {
          console.log('CAMERA IS TAKING PHOTO, DELAYING')
          resolve(this.stop())
        }, 200)
      })
    }
    this.uninjectCSS()
    if (this.cameraInterval) {
      clearInterval(this.cameraInterval)
    }

    return new Promise((_resolve, reject) => {
      CameraPreview.stop().then(
        () => {
          this.cameraIsRunning = false
          console.log('camera stopped.')
        },
        error => {
          console.log('camera could not be stopped.')
          reject(error)
        }
      )
    })
  }

  public getEntropyUpdateObservable(): Observable<Entropy> {
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

  public getCollectedEntropyPercentage(): number {
    return this.collectedEntropyPercentage / 6
  }

  public setVideoElement(element): void {
    console.log('only used in browser', element)
  }
}
