import { Directive, ElementRef, NgZone, OnInit, Renderer2 } from '@angular/core'

@Directive({
  selector: '[trace-input]',
  inputs: ['running: traceEnabled']
})
export class TraceInputDirective implements OnInit {
  private readonly canvas: HTMLCanvasElement
  private readonly context: CanvasRenderingContext2D

  private mousePos = { x: 0, y: 0 }
  private lastPos = this.mousePos

  private isDrawing: boolean

  constructor(elementRef: ElementRef, private readonly ngZone: NgZone, private readonly renderer: Renderer2) {
    this.canvas = elementRef.nativeElement
    this.context = this.canvas.getContext('2d')
  }

  public ngOnInit() {
    this.renderer.listen(this.canvas, 'mousedown', e => {
      this.lastPos = this.getMousePosition(this.canvas, e)
      this.isDrawing = true
      this.startDrawing()
    })

    this.renderer.listen(this.canvas, 'touchstart', e => {
      this.lastPos = this.getTouchPosition(this.canvas, e)
      this.isDrawing = true
      this.startDrawing()
    })

    this.renderer.listen(this.canvas, 'mouseup', e => {
      this.lastPos = this.getMousePosition(this.canvas, e)
      this.isDrawing = false
    })

    this.renderer.listen(this.canvas, 'touchend', e => {
      this.lastPos = this.getTouchPosition(this.canvas, e)
      this.isDrawing = false
    })

    this.renderer.listen(this.canvas, 'mousemove', e => {
      this.mousePos = this.getMousePosition(this.canvas, e)
    })

    this.renderer.listen(this.canvas, 'touchmove', e => {
      this.mousePos = this.getTouchPosition(this.canvas, e)
    })
  }

  public startDrawing() {
    if (!this.isDrawing) {
      return
    }

    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.renderEntropyDrawing()
      })
    })
  }

  public getMousePosition(canvas, evt) {
    const rect = canvas.getBoundingClientRect()

    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    }
  }

  public getTouchPosition(canvas, evt) {
    const rect = canvas.getBoundingClientRect()

    if (!evt.touches[0]) {
      return this.lastPos
    }

    return {
      x: evt.touches[0].clientX - rect.left,
      y: evt.touches[0].clientY - rect.top
    }
  }

  public renderEntropyDrawing() {
    this.context.strokeStyle = 'rgb(255, 255, 255)'
    this.context.moveTo(this.lastPos.x, this.lastPos.y)
    this.context.lineTo(this.mousePos.x, this.mousePos.y)
    this.context.stroke()
    this.lastPos = this.mousePos
    this.startDrawing()
  }
}
