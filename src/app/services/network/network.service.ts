import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
/**
 * This service is used to check if the device / application is connected to the internet
 */
export class NetworkService {
  // TODO: Store this in storage
  hasBeenOnlineOnce: boolean = false

  constructor() {
    window.addEventListener('online', this.webviewCanAccessInternet)
    window.addEventListener('offline', this.webviewCanAccessInternet)
  }

  public async check() {
    this.capacitorCanAccessInternet()
    this.webviewCanAccessInternet()
    this.appCanAccessInternet()
  }

  public async capacitorCanAccessInternet() {
    // TODO: Implement native check
    const isOnline = false
    if (isOnline) {
      this.hasBeenOnlineOnce = false
    }
    console.warn(`Capactor Internet Access: ${isOnline}`)
    return isOnline
  }

  public async webviewCanAccessInternet() {
    const isOnline = navigator.onLine
    if (isOnline) {
      this.hasBeenOnlineOnce = true
    }
    console.warn(`Webview Internet Access: ${isOnline}`)
    return isOnline
  }

  public async appCanAccessInternet() {
    const isOnline = await (async () => {
      try {
        const online = await fetch('http://localhost/check-internet')
        return online.status >= 200 && online.status < 300 // either true or false
      } catch (err) {
        return false // definitely offline
      }
    })()

    if (isOnline) {
      this.hasBeenOnlineOnce = true
    }

    console.warn(`App Internet Access: ${isOnline}`)

    return isOnline
  }
}
