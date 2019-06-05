import { Component, Input, OnInit, Renderer2, ViewChild } from '@angular/core'
import { Observable } from 'rxjs'

import workerJS from '../../../assets/workers/entropyCalculatorWorker'

import { Entropy, IEntropyGenerator } from './../../services/entropy/IEntropyGenerator'
const blobURL = window.URL.createObjectURL(new Blob([workerJS]))
const entropyCalculatorWorker = new Worker(blobURL)

@Component({
  selector: 'touch-entropy',
  templateUrl: './touch-entropy.component.html',
  styleUrls: ['./touch-entropy.component.scss']
})
export class TouchEntropyComponent implements OnInit, IEntropyGenerator {
  @Input()
  public cursorSize = 2

  @Input()
  public randomFactorInPercent = 10

  @Input()
  public cursorColor = 'white'

  @ViewChild('canvas')
  public canvasRef

  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private rectangle: ClientRect
  public showStrokes

  private handler

  private readonly entropyObservable: Observable<Entropy>

  private collectedEntropyPercentage: number = 0

  private isDrawing = false

  constructor(private readonly renderer: Renderer2) {
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

  public ngOnInit(): void {
    this.canvas = this.canvasRef.nativeElement

    this.canvas.setAttribute('height', `${this.canvas.parentElement.getBoundingClientRect().height}px`)
    this.canvas.setAttribute('width', `${this.canvas.parentElement.getBoundingClientRect().width}px`)

    this.context = this.canvas.getContext('2d')
    this.context.fillStyle = this.cursorColor
    this.rectangle = this.canvas.getBoundingClientRect()
    this.showStrokes = true
  }

  public ngOnDestroy(): void {
    this.showStrokes = false
  }

  public start(): Promise<void> {
    this.collectedEntropyPercentage = 0

    return new Promise(resolve => {
      this.renderer.listen(this.canvas, 'mousedown', _e => {
        this.isDrawing = true
      })

      this.renderer.listen(this.canvas, 'touchstart', _e => {
        this.isDrawing = true
      })

      this.renderer.listen(this.canvas, 'mouseup', _e => {
        this.isDrawing = false
      })

      this.renderer.listen(this.canvas, 'touchend', _e => {
        this.isDrawing = false
      })

      this.renderer.listen(this.canvas, 'mousemove', e => {
        if (this.isDrawing) {
          this.collectEntropy(e)
        }
      })

      this.renderer.listen(this.canvas, 'touchmove', e => {
        if (this.isDrawing) {
          this.collectEntropy(e)
        }
      })

      resolve()
    })
  }

  public stop(): Promise<void> {
    return new Promise(resolve => {
      this.isDrawing = false
      resolve()
    })
  }

  public collectEntropy(e) {
    const x = e.clientX || e.touches[0].clientX
    const y = e.clientY || e.touches[0].clientY

    const currX = Math.ceil(((x - this.rectangle.left) / (this.rectangle.right - this.rectangle.left)) * this.canvas.width)
    const currY = Math.ceil(((y - this.rectangle.top) / (this.rectangle.bottom - this.rectangle.top)) * this.canvas.height) - 56

    if (this.getRandomIntInclusive(0, 100) <= this.randomFactorInPercent) {
      const timeStampInMs =
        window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart
          ? window.performance.now() + window.performance.timing.navigationStart
          : Date.now()

      if (this.handler) {
        this.handler([currX, currY, timeStampInMs])
      }
    }
  }

  public getEntropyUpdateObservable(): Observable<Entropy> {
    return this.entropyObservable
  }

  private getRandomIntInclusive(min: number, max: number) {
    const randomBuffer = new Uint32Array(1)
    window.crypto.getRandomValues(randomBuffer)
    const randomNumber = randomBuffer[0] / (0xffffffff + 1)
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

  public getCollectedEntropyPercentage(): number {
    return this.collectedEntropyPercentage / 10
  }
}
