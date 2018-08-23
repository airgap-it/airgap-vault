import { Injectable } from '@angular/core'
import { Entropy, IEntropyGenerator } from '../entropy/IEntropyGenerator'
import { Observable } from 'rxjs'

@Injectable()
export class DummyEntropyService implements IEntropyGenerator {

  start(): Promise<void> {
    return Promise.resolve()
  }

  stop(): Promise<any> {
    return Promise.resolve()
  }

  getEntropyUpdateObservable(): Observable<Entropy> {
    return new Observable(observer => {
      observer.next({
        entropyHex: ''
      })
    })
  }

  getCollectedEntropyPercentage(): number {
    return 100
  }

}
