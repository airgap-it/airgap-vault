import { HapticsPlugin, ImpactStyle } from '@capacitor/haptics'

import { ScanFeedbackService } from './scan-feedback.service'

describe('ScanFeedbackService', () => {
  it('emits a light impact on Android', async () => {
    const haptics = jasmine.createSpyObj<HapticsPlugin>('Haptics', ['impact'])
    haptics.impact.and.returnValue(Promise.resolve())
    const service = new ScanFeedbackService({ is: (platform: string) => platform === 'android' } as any, haptics)

    service.notifyFrameAccepted()
    await Promise.resolve()

    expect(haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Light })
  })

  it('does not emit an impact on non-Android platforms', () => {
    const haptics = jasmine.createSpyObj<HapticsPlugin>('Haptics', ['impact'])
    const service = new ScanFeedbackService({ is: () => false } as any, haptics)

    service.notifyFrameAccepted()

    expect(haptics.impact).not.toHaveBeenCalled()
  })

  it('ignores unavailable haptics without rejecting the scan flow', async () => {
    const haptics = jasmine.createSpyObj<HapticsPlugin>('Haptics', ['impact'])
    haptics.impact.and.returnValue(Promise.reject(new Error('Unavailable')))
    const service = new ScanFeedbackService({ is: () => true } as any, haptics)

    service.notifyFrameAccepted()
    await Promise.resolve()

    expect().nothing()
  })
})
