import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { AuditLogPage } from './audit-log.page'

describe('AuditLogPage', () => {
  let component: AuditLogPage
  let fixture: ComponentFixture<AuditLogPage>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuditLogPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents()

    fixture = TestBed.createComponent(AuditLogPage)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
