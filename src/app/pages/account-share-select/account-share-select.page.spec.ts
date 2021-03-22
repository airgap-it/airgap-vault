import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { AccountShareSelectPage } from './account-share-select.page'

describe('AccountShareSelectPage', () => {
  let component: AccountShareSelectPage
  let fixture: ComponentFixture<AccountShareSelectPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountShareSelectPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(AccountShareSelectPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
