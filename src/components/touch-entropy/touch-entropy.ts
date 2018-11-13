import { Component, Input, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core'
import { Entropy, IEntropyGenerator } from '../../providers/entropy/IEntropyGenerator'
import { Observable } from 'rxjs'

import workerJS from '../../assets/workers/entropyCalculatorWorker'
const blobURL = window.URL.createObjectURL(new Blob([workerJS]))
const entropyCalculatorWorker = new Worker(blobURL)

@Component({
  selector: 'touch-entropy',
  templateUrl: 'touch-entropy.html'
})
export class TouchEntropyComponent implements OnInit, IEntropyGenerator {
  @Input()
  cursorSize = 2

  @Input()
  randomFactorInPercent = 10

  @Input()
  cursorColor = 'white'

  @ViewChild('canvas')
  canvasRef

  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private rectangle: ClientRect
  private showStrokes

  private handler

  private entropyObservable: Observable<Entropy>

  private collectedEntropyPercentage: number = 0

  private isDrawing = false

  constructor(private ngZone: NgZone, private renderer: Renderer2) {
    this.entropyObservable = Observable.create(observer => {
      entropyCalculatorWorker.onmessage = event => {
        this.collectedEntropyPercentage += event.data.entropyMeasure
        observer.next({ entropyHex: event.data.entropyHex })
      }

      this.handler = entropy => {
        const buffer1 = this.arrayBufferFromIntArray(entropy)
        entropyCalculatorWorker.postMessage({ entropyBuffer: buffer1 }, [buffer1])
      }
    })
  }

  ngOnInit(): void {
    this.canvas = this.canvasRef.nativeElement

    this.canvas.setAttribute('height', this.canvas.parentElement.getBoundingClientRect().height + 'px')
    this.canvas.setAttribute('width', this.canvas.parentElement.getBoundingClientRect().width + 'px')

    this.context = this.canvas.getContext('2d')
    this.context.fillStyle = this.cursorColor
    this.rectangle = this.canvas.getBoundingClientRect()
    this.showStrokes = true
  }

  ngOnDestroy(): void {
    this.showStrokes = false
  }

  start(): Promise<void> {
    this.collectedEntropyPercentage = 0
    return new Promise((resolve, reject) => {
      this.renderer.listen(this.canvas, 'mousedown', e => {
        this.isDrawing = true
      })

      this.renderer.listen(this.canvas, 'touchstart', e => {
        this.isDrawing = true
      })

      this.renderer.listen(this.canvas, 'mouseup', e => {
        this.isDrawing = false
      })

      this.renderer.listen(this.canvas, 'touchend', e => {
        this.isDrawing = false
      })

      this.renderer.listen(this.canvas, 'mousemove', e => {
        if (this.isDrawing) this.collectEntropy(e)
      })

      this.renderer.listen(this.canvas, 'touchmove', e => {
        if (this.isDrawing) this.collectEntropy(e)
      })

      resolve()
    })
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isDrawing = false
      resolve()
    })
  }

  collectEntropy(e) {
    let x = e.clientX || e.touches[0].clientX
    let y = e.clientY || e.touches[0].clientY

    let currX = Math.ceil(((x - this.rectangle.left) / (this.rectangle.right - this.rectangle.left)) * this.canvas.width)
    let currY = Math.ceil(((y - this.rectangle.top) / (this.rectangle.bottom - this.rectangle.top)) * this.canvas.height) - 56

    if (this.getRandomIntInclusive(0, 100) <= this.randomFactorInPercent) {
      let timeStampInMs =
        window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart
          ? window.performance.now() + window.performance.timing.navigationStart
          : Date.now()

      if (this.handler) {
        this.handler([currX, currY, timeStampInMs])
      }
    }
  }

  getEntropyUpdateObservable(): Observable<Entropy> {
    return this.entropyObservable
  }

  private getRandomIntInclusive(min, max) {
    const randomBuffer = new Uint32Array(1)
    window.crypto.getRandomValues(randomBuffer)
    let randomNumber = randomBuffer[0] / (0xffffffff + 1)
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(randomNumber * (max - min + 1)) + min
  }

  private arrayBufferFromIntArray(array: number[]) {
    const buffer = new ArrayBuffer(array.length * 2)
    const bufView = new Uint8Array(buffer)

    for (let i = 0; i < array.length; i++) {
      bufView[i] = Math.abs(array[i] * 10000)
    }

    return buffer
  }

  private appendBuffer(buffer1, buffer2): Uint8Array {
    const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength)
    tmp.set(new Uint8Array(buffer1), 0)
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength)
    return new Uint8Array(tmp.buffer)
  }

  getCollectedEntropyPercentage(): number {
    return this.collectedEntropyPercentage / 10
  }
}
