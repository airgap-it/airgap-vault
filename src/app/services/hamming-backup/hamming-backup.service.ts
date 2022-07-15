import { Injectable } from '@angular/core'
import { hamming_backup } from './hamming-backup'

@Injectable({
  providedIn: 'root'
})
export class HammingBackupService {
  constructor() {}

  hamming_backup(X: string, A: string): [string, string] {
    return hamming_backup(X, A)
  }
}
