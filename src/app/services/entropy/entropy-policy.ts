export interface EntropySourceState {
  available: boolean
  percentage: number
}

export interface EntropyCollectionState {
  isFull: boolean
  hasNoAvailableSources: boolean
}

/**
 * Touch is deliberately absent here. TalkBack reserves touch gestures for
 * navigation, so requiring drawn touch entropy would prevent a TalkBack user
 * from completing generation. Each available non-touch source must still
 * reach 100%; the OS CSPRNG is mixed into the final hash independently.
 */
export function getEntropyCollectionState(sources: EntropySourceState[]): EntropyCollectionState {
  const availableSources: EntropySourceState[] = sources.filter((source: EntropySourceState) => source.available)

  if (availableSources.length === 0) {
    return { isFull: false, hasNoAvailableSources: true }
  }

  return {
    isFull: availableSources.every((source: EntropySourceState) => source.percentage >= 100),
    hasNoAvailableSources: false
  }
}
