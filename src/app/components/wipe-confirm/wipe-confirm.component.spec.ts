import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ModalController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'

import { UnitHelper } from './../../../../test-config/unit-test-helper'
import { WipeConfirmComponent } from './wipe-confirm.component'

describe('Component: WipeConfirm', () => {
  const phrase: string = 'wipe all secrets'

  let component: WipeConfirmComponent
  let fixture: ComponentFixture<WipeConfirmComponent>
  let modalController: ModalController

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        declarations: []
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(() => {
    const translateService: TranslateService = TestBed.inject(TranslateService)
    spyOn(translateService, 'instant').and.returnValue(phrase)

    modalController = TestBed.inject(ModalController)
    spyOn(modalController, 'dismiss').and.returnValue(Promise.resolve(true))

    fixture = TestBed.createComponent(WipeConfirmComponent)
    component = fixture.componentInstance
  })

  it('should not allow a wipe before anything is confirmed', () => {
    expect(component.canWipe).toBeFalsy()
  })

  it('should not allow a wipe when only the checkboxes are ticked', () => {
    component.hasBackup = true
    component.acknowledgesLoss = true

    expect(component.canWipe).toBeFalsy()
  })

  it('should not allow a wipe when only the phrase is typed', () => {
    component.typedPhrase = phrase

    expect(component.canWipe).toBeFalsy()
  })

  it('should not allow a wipe when one checkbox is missing', () => {
    component.hasBackup = true
    component.typedPhrase = phrase

    expect(component.canWipe).toBeFalsy()
  })

  it('should not allow a wipe when the phrase does not match', () => {
    component.hasBackup = true
    component.acknowledgesLoss = true
    component.typedPhrase = 'wipe all secret'

    expect(component.canWipe).toBeFalsy()
  })

  it('should allow a wipe once both checkboxes are ticked and the phrase matches', () => {
    component.hasBackup = true
    component.acknowledgesLoss = true
    component.typedPhrase = phrase

    expect(component.canWipe).toBeTruthy()
  })

  it('should ignore case and surrounding whitespace in the typed phrase', () => {
    component.hasBackup = true
    component.acknowledgesLoss = true
    component.typedPhrase = '  WIPE All Secrets '

    expect(component.canWipe).toBeTruthy()
  })

  it('should dismiss with the confirm role when everything is confirmed', async () => {
    component.hasBackup = true
    component.acknowledgesLoss = true
    component.typedPhrase = phrase

    await component.confirm()

    expect(modalController.dismiss).toHaveBeenCalledWith(undefined, 'confirm')
  })

  it('should not dismiss with the confirm role when the gate is not passed', async () => {
    component.hasBackup = true
    component.typedPhrase = phrase

    await component.confirm()

    expect(modalController.dismiss).not.toHaveBeenCalled()
  })

  it('should dismiss with the cancel role on cancel', async () => {
    await component.cancel()

    expect(modalController.dismiss).toHaveBeenCalledWith(undefined, 'cancel')
  })
})
