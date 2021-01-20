import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { AccountDetailPage } from './account-detail.page'

describe('AccountDetailPage', () => {
  let component: AccountDetailPage
  let fixture: ComponentFixture<AccountDetailPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountDetailPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(AccountDetailPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
