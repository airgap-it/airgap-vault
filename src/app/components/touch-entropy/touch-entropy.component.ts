import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core'
import { Observable, Subscriber } from 'rxjs'

import entropyCalculatorWorkerJS from '../../../assets/workers/entropyCalculatorWorker'

import { Entropy, IEntropyGenerator } from './../../services/entropy/IEntropyGenerator'
const blobURL: string = window.URL.createObjectURL(new Blob([entropyCalculatorWorkerJS]))
const entropyCalculatorWorker: Worker = new Worker(blobURL)

@Component({
  selector: 'airgap-touch-entropy',
  templateUrl: './touch-entropy.component.html',
  styleUrls: ['./touch-entropy.component.scss']
})
export class TouchEntropyComponent implements OnInit, IEntropyGenerator {
  @Input()
  public cursorSize: number = 2

  @Input()
  public randomFactorInPercent: number = 10

  @Input()
  public cursorColor: string = 'white'

  @ViewChild('canvas')
  public canvasRef: ElementRef<HTMLCanvasElement>

  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private rectangle: ClientRect

  private handler: (numbers: number[]) => void

  private readonly entropyObservable: Observable<Entropy>

  private collectedEntropyPercentage: number = 0

  private isDrawing: boolean = false

  constructor(private readonly renderer: Renderer2) {
    this.entropyObservable = new Observable(
      (observer: Subscriber<Entropy>): void => {
        entropyCalculatorWorker.onmessage = (event: MessageEvent): void => {
          this.collectedEntropyPercentage += event.data.entropyMeasure
          observer.next({ entropyHex: event.data.entropyHex })
        }

        this.handler = (numbers: number[]): void => {
          const buffer1: ArrayBuffer = this.arrayBufferFromIntArray(numbers)
          entropyCalculatorWorker.postMessage({ entropyBuffer: buffer1 }, [buffer1])
        }
      }
    )
  }

  public ngOnInit(): void {
    this.canvas = this.canvasRef.nativeElement

    this.canvas.setAttribute('height', `${this.canvas.parentElement.getBoundingClientRect().height}px`)
    this.canvas.setAttribute('width', `${this.canvas.parentElement.getBoundingClientRect().width}px`)

    this.context = this.canvas.getContext('2d')
    this.context.fillStyle = this.cursorColor
    this.rectangle = this.canvas.getBoundingClientRect()
  }

  public start(): Promise<void> {
    this.collectedEntropyPercentage = 0

    return new Promise(resolve => {
      this.renderer.listen(this.canvas, 'mousedown', () => {
        this.isDrawing = true
      })

      this.renderer.listen(this.canvas, 'touchstart', () => {
        this.isDrawing = true
      })

      this.renderer.listen(this.canvas, 'mouseup', () => {
        this.isDrawing = false
      })

      this.renderer.listen(this.canvas, 'touchend', () => {
        this.isDrawing = false
      })

      this.renderer.listen(this.canvas, 'mousemove', (event: MouseEvent) => {
        if (this.isDrawing) {
          this.collectEntropy(event.clientX, event.clientY)
        }
      })

      this.renderer.listen(this.canvas, 'touchmove', (event: TouchEvent) => {
        if (this.isDrawing) {
          this.collectEntropy(event.touches[0].clientX, event.touches[0].clientY)
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

  public collectEntropy(x: number, y: number): void {
    const currX: number = Math.ceil(((x - this.rectangle.left) / (this.rectangle.right - this.rectangle.left)) * this.canvas.width)
    const currY: number = Math.ceil(((y - this.rectangle.top) / (this.rectangle.bottom - this.rectangle.top)) * this.canvas.height) - 56

    if (this.getRandomIntInclusive(0, 100) <= this.randomFactorInPercent) {
      const timeStampInMs: number =
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

  private getRandomIntInclusive(min: number, max: number): number {
    const randomBuffer: Uint32Array = new Uint32Array(1)

    window.crypto.getRandomValues(randomBuffer)

    const randomNumber: number = randomBuffer[0] / (0xffffffff + 1)
    const roundedMin: number = Math.ceil(min)
    const roundedMax: number = Math.floor(max)

    return Math.floor(randomNumber * (roundedMax - roundedMin + 1)) + roundedMin
  }

  private arrayBufferFromIntArray(array: number[]): ArrayBuffer {
    const buffer: ArrayBuffer = new ArrayBuffer(array.length * 2)
    const bufView: Uint8Array = new Uint8Array(buffer)

    for (let i: number = 0; i < array.length; i++) {
      bufView[i] = Math.abs(array[i] * 10000)
    }

    return buffer
  }

  public getCollectedEntropyPercentage(): number {
    return this.collectedEntropyPercentage / 10
  }
}
