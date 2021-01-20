import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { SecretDetailPage } from './secret-detail.page'

describe('SecretDetailPage', () => {
  let component: SecretDetailPage
  let fixture: ComponentFixture<SecretDetailPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SecretDetailPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(SecretDetailPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
