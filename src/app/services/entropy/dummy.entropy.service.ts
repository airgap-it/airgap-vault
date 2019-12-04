import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'

import { Entropy, IEntropyGenerator } from '../entropy/IEntropyGenerator'

@Injectable({
  providedIn: 'root'
})
export class DummyEntropyService implements IEntropyGenerator {
  public start(): Promise<void> {
    return Promise.resolve()
  }

  public stop(): Promise<any> {
    return Promise.resolve()
  }

  public getEntropyUpdateObservable(): Observable<Entropy> {
    return new Observable(observer => {
      observer.next({
        entropyHex: ''
      })
    })
  }

  public getCollectedEntropyPercentage(): number {
    return 0
  }
}
