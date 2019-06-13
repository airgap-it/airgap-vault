import { ErrorHandler } from '@angular/core'

export enum ErrorCategory {
  CORDOVA_PLUGIN = 'cordova_plugin',
  IONIC_MODAL = 'ionic_modal',
  IONIC_ALERT = 'ionic_alert',
  IONIC_LOADER = 'ionic_loader',
  IONIC_NAVIGATION = 'navigation',
  WALLET_SERVICE = 'wallet_service',
  SCHEME_ROUTING = 'scheme_routing',
  SECURE_STORAGE = 'secure_storage',
  INIT_CHECK = 'init_check',
  ENTROPY_COLLECTION = 'entropy_collection',
  INTERACTION_SERVICE = 'interaction_service',
  DEEPLINK_SERVICE = 'deeplink_service',
  OTHER = 'other'
}

type ErrorCallback = (error: Error & { originalError?: Error }) => void

const handleErrorLocal: (category: ErrorCategory) => ErrorCallback = (category?: ErrorCategory): ErrorCallback => {
  return (error: Error & { originalError?: Error }): void => {
    console.log('saving error locally, category', category)
    console.error(error.originalError || error)
  }
}

const handleErrorIgnore: ErrorCallback = (error: { originalError?: Error }): void => {
  console.log('ignoring error')
  console.error(error.originalError || error)
}

export { handleErrorIgnore, handleErrorLocal }

export class ErrorHandlerService extends ErrorHandler {
  public handleError(error: Error): void {
    super.handleError(error)
    handleErrorLocal(ErrorCategory.OTHER)(error)
  }
}
