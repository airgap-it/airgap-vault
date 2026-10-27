import { Haptics, ImpactStyle } from '@capacitor/haptics'

import { ScanFeedbackService } from './scan-feedback.service'

describe('ScanFeedbackService', () => {
  it('emits a light impact on Android', async () => {
    const impact = spyOn(Haptics, 'impact').and.returnValue(Promise.resolve())
    const service = new ScanFeedbackService({ is: (platform: string) => platform === 'android' } as any)

    service.notifyFrameAccepted()
    await Promise.resolve()

    expect(impact).toHaveBeenCalledWith({ style: ImpactStyle.Light })
  })

  it('does not emit an impact on non-Android platforms', () => {
    const impact = spyOn(Haptics, 'impact')
    const service = new ScanFeedbackService({ is: () => false } as any)

    service.notifyFrameAccepted()

    expect(impact).not.toHaveBeenCalled()
  })

  it('ignores unavailable haptics without rejecting the scan flow', async () => {
    spyOn(Haptics, 'impact').and.returnValue(Promise.reject(new Error('Unavailable')))
    const service = new ScanFeedbackService({ is: () => true } as any)

    service.notifyFrameAccepted()
    await Promise.resolve()

    expect().nothing()
  })
})
