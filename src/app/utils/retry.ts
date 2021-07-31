type RetryActionType = 'abort' | 'retry'
interface RetryAction<Type extends RetryActionType, Args> {
  type: Type
  nextArgs?: Args
}

type NextAction<S> = RetryAction<'abort', undefined> | (S extends undefined ? RetryAction<'retry', S> : Required<RetryAction<'retry', S>>)

export async function retry<T, S = undefined, E = unknown>(setup: {
  action: (args: S) => Promise<T>
  onFailure: (error: E) => Promise<NextAction<S>>
  initArgs?: S
}): Promise<T> {
  let result: T
  let currentAction: RetryActionType
  let args: S | undefined = setup.initArgs
  do {
    try {
      currentAction = 'abort'
      result = await setup.action(args)
    } catch (error) {
      const nextAction: NextAction<S> = await setup.onFailure(error)
      currentAction = nextAction.type
      args = nextAction.nextArgs
    }
  } while (currentAction === 'retry')

  return result
}
