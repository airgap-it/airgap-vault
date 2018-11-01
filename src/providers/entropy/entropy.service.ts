import { Injectable } from '@angular/core'
import { IEntropyGenerator } from './IEntropyGenerator'
import { sha3_256 } from 'js-sha3'
import { Observable, Subscription } from 'rxjs'
import { Observer } from 'rxjs/Observer'

import workerJS from '../../assets/workers/hashWorker'
const blobURL = window.URL.createObjectURL(new Blob([workerJS]))
const hashWorker = new Worker(blobURL)

@Injectable()
export class EntropyService {

  ENTROPY_SIZE = 4096

  entropyGenerators: IEntropyGenerator[] = []
  entropySubscriptions: Subscription[] = []

  private entropyUpdateObservable: Observable<void>
  private entropyUpdateObserver: Observer<void>

  constructor() {
    this.entropyUpdateObservable = Observable.create(observer => {
      this.entropyUpdateObserver = observer
    })
  }

  addEntropySource(entropyGenerator: IEntropyGenerator) {
    this.entropyGenerators.push(entropyGenerator)
  }

  getEntropyUpdateObservable(): Observable<void> {
    return this.entropyUpdateObservable
  }

  startEntropyCollection(): Promise<void[]> {
    const promises = []
    const secureRandomArray = new Uint8Array(this.ENTROPY_SIZE)
    window.crypto.getRandomValues(secureRandomArray)

    hashWorker.postMessage({ call: 'init', secureRandom: Array.from(secureRandomArray) })

    for (let generator of this.entropyGenerators) {
      promises.push(generator.start().then(() => {
        console.log('generator started')
        let entropySubscription = generator.getEntropyUpdateObservable().subscribe(result => {
          try {
            hashWorker.postMessage({ entropyHex: result.entropyHex, call: 'update' })
          } catch (error) {
            console.warn(error)
          }
          this.entropyUpdateObserver.next(void 0)
        })
        this.entropySubscriptions.push(entropySubscription)
        return
      }))
    }
    return Promise.all(promises)
  }

  stopEntropyCollection(): Promise<void> {
    let promises = []
    return new Promise((resolve, reject) => {
      // clear collection interval
      for (let i = 0; i < this.entropySubscriptions.length; i++) {
        this.entropySubscriptions[i].unsubscribe()
      }

      this.entropySubscriptions = []

      // stop entropy sources
      for (let i = 0; i < this.entropyGenerators.length; i++) {
        console.log('stopping entropy source...')
        promises.push(this.entropyGenerators[i].stop())
      }

      this.entropyGenerators = []

      Promise.all(promises).then(() => {
        resolve()
      })
    })
  }

  getEntropyAsHex(): Promise<string> {
    return new Promise((resolve, reject) => {
      hashWorker.onmessage = (event) => {
        const secureRandomArray = new Uint8Array(this.ENTROPY_SIZE)
        window.crypto.getRandomValues(secureRandomArray)

        const hash = sha3_256.create()
        hash.update(event.data.hash)
        hash.update(secureRandomArray)

        resolve(hash.hex())
      }

      hashWorker.postMessage({ call: 'digest' })
    })
  }

}
