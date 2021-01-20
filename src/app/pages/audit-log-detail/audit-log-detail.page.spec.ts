import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { AuditLogDetailPage } from './audit-log-detail.page'

describe('AuditLogDetailPage', () => {
  let component: AuditLogDetailPage
  let fixture: ComponentFixture<AuditLogDetailPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuditLogDetailPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(AuditLogDetailPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
