import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { SecretOptionItemComponent } from './secret-option-item.component'

describe('SecretOptionItemComponent', () => {
  let component: SecretOptionItemComponent
  let fixture: ComponentFixture<SecretOptionItemComponent>

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SecretOptionItemComponent],
        imports: [IonicModule.forRoot()]
      }).compileComponents()

      fixture = TestBed.createComponent(SecretOptionItemComponent)
      component = fixture.componentInstance
      fixture.detectChanges()
    })
  )

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('emits once when a checkbox value changes', () => {
    component.checkboxValue = false
    const action = spyOn(component.action, 'emit')

    component.onItemClick()
    component.onCheckboxChange()

    expect(action).toHaveBeenCalledTimes(1)
  })

  it('emits when a non-checkbox item is clicked', () => {
    const action = spyOn(component.action, 'emit')

    component.onItemClick()

    expect(action).toHaveBeenCalledTimes(1)
  })
})
