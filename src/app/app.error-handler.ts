import { ErrorHandler } from '@angular/core'
import { registerPlugin } from '@capacitor/core'

export class AppErrorHandler extends ErrorHandler {
  private readonly errorPlugin: any = registerPlugin('ErrorPlugin')

  handleError(error: any): void {
    this.errorPlugin.show({ 
      error: error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : typeof error === 'object'
        ? error
        : { error }
    })
  }
}