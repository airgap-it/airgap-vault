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
})
