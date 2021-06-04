import { newSpy } from './unit-test-helper'

// tslint:disable:max-classes-per-file

export type Spied<T> = { [Method in keyof T]: jasmine.Spy }

export class RouterMock {
  public navigateByUrl: jasmine.Spy = jasmine.createSpy('navigateByUrl').and.returnValue(Promise.resolve())
  public navigate: jasmine.Spy = jasmine.createSpy('navigate').and.returnValue(Promise.resolve())
}

export class ClipboardMock {
  public read: jasmine.Spy = newSpy('read', Promise.resolve())
  public write: jasmine.Spy = newSpy('write', Promise.resolve())
}

export class ModalControllerMock {
  public create: jasmine.Spy = jasmine.createSpy('create').and.returnValue(
    Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve())
    })
  )
  public dismiss: jasmine.Spy = jasmine.createSpy('dismiss').and.returnValue(Promise.resolve())
}

export class AlertControllerMock {
  public create: jasmine.Spy = jasmine.createSpy('create').and.returnValue(
    Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve())
    })
  )
  public dismiss: jasmine.Spy = jasmine.createSpy('dismiss').and.returnValue(Promise.resolve())
}

export class LoadingControllerMock {
  public create: jasmine.Spy = jasmine.createSpy('create').and.returnValue(
    Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      onDidDismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve())
    })
  )
}

export class ToastControllerMock {
  public create: jasmine.Spy = jasmine.createSpy('create').and.returnValue(
    Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      onDidDismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve())
    })
  )
}

export class MockActivatedRouteSnapshot {
  private readonly _data: any

  constructor(data: any) {
    this._data = data
  }

  get data(): any {
    return this._data
  }
}
export class DeviceProviderMock {
  public isRooted: boolean = false
  public isElectron: boolean = false

  public async checkForRoot(): Promise<boolean> {
    return this.isRooted
  }

  public async checkForElectron(): Promise<boolean> {
    return this.isElectron
  }
}

export class NavParamsMock {
  public static params: any = {}

  public static setParams(value: any): void {
    NavParamsMock.params = value
  }

  public get(key: string): any {
    if (NavParamsMock.params[key]) {
      return NavParamsMock.params[key]
    }

    return undefined
  }
}

export class PlatformMock {
  public ready: jasmine.Spy = newSpy('ready', Promise.resolve())

  public getQueryParam(): boolean {
    return true
  }

  public hasFocus(_ele: HTMLElement): boolean {
    return true
  }

  public doc(): HTMLDocument {
    return document
  }

  public is(): boolean {
    console.log('MOCK IS NOT CORDOVA ')

    return false
  }

  public getElementComputedStyle(_container: any): any {
    return {
      paddingLeft: '10',
      paddingTop: '10',
      paddingRight: '10',
      paddingBottom: '10'
    }
  }

  public onResize(callback: any) {
    return callback
  }

  public registerListener(_ele: any, _eventName: string, _callback: any): Function {
    return () => true
  }

  public win(): Window {
    return window
  }

  public raf(_callback: any): number {
    return 1
  }

  public timeout(callback: any, timer: number): any {
    return setTimeout(callback, timer)
  }

  public cancelTimeout(_id: any): void {
    // do nothing
  }

  public getActiveElement(): any {
    return document.activeElement
  }
}

export class NavControllerMock {
  public pop(): any {
    return new Promise((resolve: Function): void => {
      resolve()
    })
  }

  public push(_ctrl: any, _args: any): any {
    return new Promise((resolve: Function): void => {
      resolve()
    })
  }

  public getActive(): any {
    return {
      instance: {
        model: 'something'
      }
    }
  }

  public setRoot(): any {
    return true
  }

  public registerChildNav(_nav: any): void {
    return
  }
}

export class DeeplinkMock {
  public create: jasmine.Spy = newSpy(
    'route',
    Promise.resolve({
      subscribe: jasmine.createSpy('subscribe').and.returnValue(Promise.resolve())
    })
  )
}
