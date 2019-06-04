export interface ExposedPromise<T> {
  promise: Promise<T>
  resolve(value?: T | PromiseLike<T>): void
  reject(reason?: unknown): void
}

function notInitialized() {
  throw new Error('ExposedPromise not initialized yet.')
}

export function exposedPromise<T>(): ExposedPromise<T> {
  let resolve: (value?: T | PromiseLike<T>) => void = notInitialized
  let reject: (reason?: unknown) => void = notInitialized

  // tslint:disable-next-line:promise-must-complete
  const promise: Promise<T> = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve
    reject = innerReject
  })

  return { promise, resolve, reject }
}
