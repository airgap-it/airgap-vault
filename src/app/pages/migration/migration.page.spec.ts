import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { MigrationPage } from './migration.page'

describe('MigrationPage', () => {
  let component: MigrationPage
  let fixture: ComponentFixture<MigrationPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MigrationPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(MigrationPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
