// tslint:disable:max-classes-per-file

const newSpy = (name: string, returnValue: any): jasmine.Spy => jasmine.createSpy(name).and.returnValue(returnValue)

class ComponentMock {}

export type Spied<T> = { [Method in keyof T]: jasmine.Spy }

export class RouterMock {
  public navigateByUrl = jasmine.createSpy('navigateByUrl').and.returnValue(Promise.resolve())
  public navigate = jasmine.createSpy('navigate').and.returnValue(Promise.resolve())
}

export class ModalControllerMock {
  public create = jasmine.createSpy('create').and.returnValue(
    Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve())
    })
  )
  public dismiss = jasmine.createSpy('dismiss').and.returnValue(Promise.resolve())
}

export class AlertControllerMock {
  public create = jasmine.createSpy('create').and.returnValue(
    Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve())
    })
  )
  public dismiss = jasmine.createSpy('dismiss').and.returnValue(Promise.resolve())
}

export class LoadingControllerMock {
  public create = jasmine.createSpy('create').and.returnValue(
    Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      onDidDismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve())
    })
  )
}

export class ToastControllerMock {
  public create = jasmine.createSpy('create').and.returnValue(
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

  get data() {
    return this._data
  }
}
export class DeviceProviderMock {
  public isRooted = 0

  public checkForRoot() {
    return Promise.resolve(this.isRooted)
  }
}

export class NavParamsMock {
  public static params: any = {}

  public static setParams(value: any) {
    NavParamsMock.params = value
  }

  public get(key: string): any {
    if (NavParamsMock.params[key]) {
      return NavParamsMock.params[key]
    }

    return undefined
  }
}

export class AppVersionMock {
  public getAppName: jasmine.Spy = newSpy('getAppName', Promise.resolve('AirGap.UnitTest'))
  public getPackageName: jasmine.Spy = newSpy('getPackageName', Promise.resolve('AirGap'))
  public getVersionNumber: jasmine.Spy = newSpy('getVersionNumber', Promise.resolve('0.0.0'))
  public getVersionCode: jasmine.Spy = newSpy('getVersionCode', Promise.resolve('0'))
}

export class PlatformMock {
  public ready: jasmine.Spy = newSpy('ready', Promise.resolve())

  public getQueryParam(): boolean {
    return true
  }

  public hasFocus(ele: HTMLElement): boolean {
    return true
  }

  public doc(): HTMLDocument {
    return document
  }

  public is(): boolean {
    console.log('MOCK IS NOT CORDOVA ')

    return false
  }

  public getElementComputedStyle(container: any): any {
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

  public registerListener(ele: any, eventName: string, callback: any): Function {
    return () => true
  }

  public win(): Window {
    return window
  }

  public raf(callback: any): number {
    return 1
  }

  public timeout(callback: any, timer: number): any {
    return setTimeout(callback, timer)
  }

  public cancelTimeout(id: any) {
    // do nothing
  }

  public getActiveElement(): any {
    return document.activeElement
  }
}

export class NavControllerMock {
  public pop(): any {
    return new Promise(function(resolve: Function): void {
      resolve()
    })
  }

  public push(ctrl: any, args: any): any {
    return new Promise(function(resolve: Function): void {
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

  public registerChildNav(nav: any): void {
    return
  }
}

export class StatusBarMock {
  public styleDefault: jasmine.Spy = newSpy('styleDefault', Promise.resolve())
  public backgroundColorByHexString: jasmine.Spy = newSpy('backgroundColorByHexString', Promise.resolve())
}

export class SplashScreenMock {
  public hide: jasmine.Spy = newSpy('hide', Promise.resolve())
}

export class DeeplinkMock {
  public create: jasmine.Spy = newSpy(
    'route',
    Promise.resolve({
      subscribe: jasmine.createSpy('subscribe').and.returnValue(Promise.resolve())
    })
  )
}
