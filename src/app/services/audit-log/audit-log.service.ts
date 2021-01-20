import { Injectable } from '@angular/core'

// https://security.berkeley.edu/security-audit-logging-guideline

enum AuditLogEvent {
  APP_START = 'APP_START',
  APP_CLOSE = 'APP_CLOSE',
  APP_RESUME = 'APP_RESUME',
  AUTH_CORRECT = 'AUTH_CORRECT',
  AUTH_ERROR = '',
  PIN_STANDARD = '',
  PIN_DECOY = '',
  PIN_DURESS = '',
  PIN_WRONG = '',
  SECRET_VIEW = '',
  SECRET_EDIT = '',
  ADDRESS_VIEW = '',
  MESSAGE_INCOMING = '',
  MESSAGE_OUTGOING = '',
  TRANSACTION_SIGN = '',
  MESSAGE_SIGN = ''
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  constructor() {}

  public addLog() {}

  public viewLog() {}
}
