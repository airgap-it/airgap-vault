import { Observable } from 'rxjs'

export interface Entropy {
  entropyHex: string
}

export interface IEntropyGenerator {
  start(): Promise<void>
  stop(): Promise<void>
  getEntropyUpdateObservable(): Observable<Entropy>
  getCollectedEntropyPercentage(): number
}
