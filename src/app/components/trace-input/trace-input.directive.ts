import { Directive, ElementRef, NgZone, OnInit, Renderer2 } from '@angular/core'

interface Point {
  x: number
  y: number
}

@Directive({
  selector: ''
})
export class TraceInputDirective implements OnInit {
  private readonly canvas: HTMLCanvasElement
  private readonly context: CanvasRenderingContext2D

  private mousePos: Point = { x: 0, y: 0 }
  private lastPos: Point = this.mousePos

  private isDrawing: boolean

  constructor(elementRef: ElementRef, private readonly ngZone: NgZone, private readonly renderer: Renderer2) {
    this.canvas = elementRef.nativeElement
    const context = this.canvas.getContext('2d')
    if (context) {
      this.context = context
    }
  }

  public ngOnInit(): void {
    this.renderer.listen(this.canvas, 'mousedown', (event: MouseEvent) => {
      this.lastPos = this.getMousePosition(this.canvas, event)
      this.mousePos = { ...this.lastPos }
      this.isDrawing = true
      this.startDrawing()
    })

    this.renderer.listen(this.canvas, 'touchstart', (event: TouchEvent) => {
      this.lastPos = this.getTouchPosition(this.canvas, event)
      this.mousePos = { ...this.lastPos }
      this.isDrawing = true
      this.startDrawing()
    })

    this.renderer.listen(this.canvas, 'mouseup', (event: MouseEvent) => {
      this.lastPos = this.getMousePosition(this.canvas, event)
      this.isDrawing = false
    })

    this.renderer.listen(this.canvas, 'touchend', (event: TouchEvent) => {
      this.lastPos = this.getTouchPosition(this.canvas, event)
      this.isDrawing = false
    })

    this.renderer.listen(this.canvas, 'mousemove', (event: MouseEvent) => {
      this.mousePos = this.getMousePosition(this.canvas, event)
    })

    this.renderer.listen(this.canvas, 'touchmove', (event: TouchEvent) => {
      this.mousePos = this.getTouchPosition(this.canvas, event)
    })
  }

  public startDrawing(): void {
    if (!this.isDrawing) {
      return
    }

    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.renderEntropyDrawing()
      })
    })
  }

  public getMousePosition(canvas: HTMLCanvasElement, event: MouseEvent): Point {
    const rect: ClientRect | DOMRect = canvas.getBoundingClientRect()

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }

  public getTouchPosition(canvas: HTMLCanvasElement, event: TouchEvent): Point {
    const rect: ClientRect | DOMRect = canvas.getBoundingClientRect()

    if (!event.touches[0]) {
      return this.lastPos
    }

    return {
      x: event.touches[0].clientX - rect.left,
      y: event.touches[0].clientY - rect.top
    }
  }

  public renderEntropyDrawing(): void {
    this.context.strokeStyle = 'rgb(255, 255, 255)'
    this.context.moveTo(this.lastPos.x, this.lastPos.y)
    this.context.lineTo(this.mousePos.x, this.mousePos.y)
    this.lastPos = this.mousePos
    this.context.stroke()
    this.startDrawing()
  }
}
