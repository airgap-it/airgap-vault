import { getEntropyCollectionState } from './entropy-policy'

describe('entropy collection policy', () => {
  it('reports an error when no non-touch source becomes available', () => {
    expect(getEntropyCollectionState([{ available: false, percentage: 0 }])).toEqual({ isFull: false, hasNoAvailableSources: true })
  })

  it('includes a source which starts after the startup window', () => {
    expect(getEntropyCollectionState([{ available: true, percentage: 100 }, { available: true, percentage: 10 }])).toEqual({
      isFull: false,
      hasNoAvailableSources: false
    })
  })

  it('does not require a disabled source', () => {
    expect(getEntropyCollectionState([{ available: true, percentage: 100 }, { available: false, percentage: 0 }])).toEqual({
      isFull: true,
      hasNoAvailableSources: false
    })
  })

  it('completes only when every available source is full', () => {
    expect(getEntropyCollectionState([{ available: true, percentage: 100 }, { available: true, percentage: 100 }])).toEqual({
      isFull: true,
      hasNoAvailableSources: false
    })
  })

  it('re-evaluates when source availability changes after startup', () => {
    expect(getEntropyCollectionState([{ available: true, percentage: 100 }, { available: false, percentage: 0 }]).isFull).toBe(true)
    expect(getEntropyCollectionState([{ available: true, percentage: 100 }, { available: true, percentage: 1 }]).isFull).toBe(false)
  })
})
