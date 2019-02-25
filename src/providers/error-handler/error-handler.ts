import { IonicErrorHandler } from 'ionic-angular'

export enum ErrorCategory {
  CORDOVA_PLUGIN = 'cordova_plugin',
  IONIC_MODAL = 'ionic_modal',
  IONIC_ALERT = 'ionic_alert',
  IONIC_LOADER = 'ionic_loader',
  IONIC_NAVIGATION = 'navigation',
  WALLET_PROVIDER = 'wallet_provider',
  SCHEME_ROUTING = 'scheme_routing',
  SECURE_STORAGE = 'secure_storage',
  INIT_CHECK = 'init_check',
  ENTROPY_COLLECTION = 'entropy_collection',
  INTERACTION_PROVIDER = 'interaction_provider',
  DEEPLINK_PROVIDER = 'deeplink_provider'
}

const handleErrorLocal = (category?: ErrorCategory) => {
  return error => {
    console.log('saving error locally, category', category)
    console.error(error.originalError || error)
  }
}

const handleErrorIgnore = error => {
  console.log('ignoring error')
  console.error(error.originalError || error)
}

export { handleErrorIgnore, handleErrorLocal }

export class ErrorHandlerProvider extends IonicErrorHandler {
  handleError(error) {
    super.handleError(error)
    handleErrorLocal(error)
  }
}
