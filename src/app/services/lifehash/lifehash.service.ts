import { Injectable } from '@angular/core'

import instantiate_lifehash, { LifeHashModule } from '../../utils/lifehash/lifehash'

@Injectable({
  providedIn: 'root'
})
export class LifehashService {
  public lifehashInstancePromise: Promise<LifeHashModule>

  constructor() {
    this.lifehashInstancePromise = instantiate_lifehash()
  }

  public async generateLifehash(str: string) {
    const img: HTMLImageElement = (await this.lifehashInstancePromise).makeFromUTF8(str, 1, 2)

    return img.src
  }
}
