import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { GridInputComponent } from './grid-input.component'

describe('GridInputComponent', () => {
  let component: GridInputComponent
  let fixture: ComponentFixture<GridInputComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GridInputComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(GridInputComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
