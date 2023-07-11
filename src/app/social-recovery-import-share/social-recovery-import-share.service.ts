import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class SocialRecoveryImportShareService {
  private sharesMap: Map<number, { shareName: string; share: string[] }> = new Map()

  getMap() {
    return this.sharesMap
  }

  setMap(shareNumber: number, name: string, share: string[]) {
    this.sharesMap.set(shareNumber, { shareName: name, share: share })
  }

  resetMap() {
    this.sharesMap = new Map()
  }
}
