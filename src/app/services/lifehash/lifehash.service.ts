import { Injectable } from '@angular/core'
import { LifeHash, LifeHashVersion } from 'lifehash'

@Injectable({
  providedIn: 'root'
})
export class LifehashService {
  constructor() {}

  public async generateLifehash(str: string) {
    const image = LifeHash.makeFrom(str, LifeHashVersion.version2, 1, true)
    return image.toDataUrl()
  }
}
