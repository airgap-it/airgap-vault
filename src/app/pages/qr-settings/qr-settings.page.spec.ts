import { SerializerService } from '@airgap/angular-core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { TranslateModule, TranslateService } from '@ngx-translate/core'

import { QrSettingsPage } from './qr-settings.page'

describe('QrSettingsPage sliders', () => {
  let fixture: ComponentFixture<QrSettingsPage>
  let settings: {
    useV3: boolean
    displayTimePerChunk: number
    singleChunkSize: number
    multiChunkSize: number
    resetSettings: jasmine.Spy
  }

  beforeEach(async () => {
    settings = {
      useV3: true,
      displayTimePerChunk: 200,
      singleChunkSize: 500,
      multiChunkSize: 250,
      resetSettings: jasmine.createSpy('resetSettings').and.callFake(async () => {
        settings.useV3 = true
        settings.displayTimePerChunk = 200
        settings.singleChunkSize = 500
        settings.multiChunkSize = 250
      })
    }
    await TestBed.configureTestingModule({
      declarations: [QrSettingsPage],
      imports: [FormsModule, IonicModule.forRoot(), TranslateModule.forRoot()],
      providers: [{ provide: SerializerService, useValue: settings }]
    }).compileComponents()
    const translate = TestBed.inject(TranslateService)
    translate.setTranslation('en', {
      'qr-settings': {
        'page-time_label': 'Page time',
        'single-page-size_label': 'Single page size',
        'multi-page-size_label': 'Multi page size'
      }
    })
    translate.use('en')
    fixture = TestBed.createComponent(QrSettingsPage)
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
  })

  const cases = [
    { id: 'qr-display-time', setting: 'displayTimePerChunk', min: 50, max: 500, step: 25, initial: 200, next: 225, label: 'Page time' },
    {
      id: 'qr-single-chunk-size',
      setting: 'singleChunkSize',
      min: 100,
      max: 2000,
      step: 50,
      initial: 500,
      next: 550,
      label: 'Single page size'
    },
    {
      id: 'qr-multi-chunk-size',
      setting: 'multiChunkSize',
      min: 20,
      max: 1000,
      step: 10,
      initial: 250,
      next: 260,
      label: 'Multi page size'
    }
  ] as const

  cases.forEach(({ id, setting, min, max, step, initial, next, label }) => {
    it(`exposes ${setting} as a labelled native slider with the stored value`, () => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector(`#${id}`)
      expect(input.type).toBe('range')
      expect(input.min).toBe(String(min))
      expect(input.max).toBe(String(max))
      expect(input.step).toBe(String(step))
      expect(input.valueAsNumber).toBe(initial)
      expect(input.labels.length).toBe(1)
      expect(input.labels[0].textContent).toContain(label)
    })

    it(`saves a native input adjustment of ${setting} as a number and refreshes its label`, async () => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector(`#${id}`)
      input.value = String(next)
      input.dispatchEvent(new Event('input', { bubbles: true }))
      fixture.detectChanges()
      await fixture.whenStable()
      expect(settings[setting]).toBe(next)
      expect(input.labels[0].textContent).toContain(String(next))
    })

    it(`keeps native ${setting} adjustments within its bounds`, () => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector(`#${id}`)
      input.value = String(max)
      input.stepUp()
      input.dispatchEvent(new Event('input', { bubbles: true }))
      expect(settings[setting]).toBe(max)
      input.value = String(min)
      input.stepDown()
      input.dispatchEvent(new Event('input', { bubbles: true }))
      expect(settings[setting]).toBe(min)
    })
  })

  it('uses 20-byte steps once the multi-page value is aligned', async () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#qr-multi-chunk-size')
    input.stepUp()
    input.dispatchEvent(new Event('input', { bubbles: true }))
    fixture.detectChanges()
    await fixture.whenStable()
    expect(settings.multiChunkSize).toBe(260)
    expect(input.step).toBe('20')
    input.stepUp()
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(settings.multiChunkSize).toBe(280)
  })

  it('restores all native sliders when settings are reset', async () => {
    settings.displayTimePerChunk = 300
    settings.singleChunkSize = 1000
    settings.multiChunkSize = 400
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.nativeElement.querySelector('ion-button').click()
    await fixture.whenStable()
    fixture.detectChanges()
    await fixture.whenStable()
    expect(settings.resetSettings).toHaveBeenCalled()
    cases.forEach(({ id, initial }) => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector(`#${id}`)
      expect(input.valueAsNumber).toBe(initial)
    })
  })
})
