import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { AddAddressComponent } from './add-address.component'
import { provideMockStore } from '@ngrx/store/testing'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { ContactsService } from 'src/app/services/contacts/contacts.service'
import { firstValueFrom, of } from 'rxjs'

describe('AddAddressComponent', () => {
  let component: AddAddressComponent
  let fixture: ComponentFixture<AddAddressComponent>
  const navigationSpy = jasmine.createSpyObj('navigation', ['routeWithState'])
  const contactsSpy = jasmine.createSpyObj('contacts', [
    'isAddressInContacts',
    'getContactName',
    'isBookEnabled',
    'addSuggestion',
    'setBookEnable'
  ])

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddAddressComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: NavigationService, useValue: navigationSpy },
        { provide: ContactsService, useValue: contactsSpy },
        provideMockStore({ initialState: {}, selectors: [] })
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(AddAddressComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should run ngOnInit', () => {
    component.airGapTxs = [{ amount: '0' , fee: '1', from: ['mock_address'], to: [], isInbound: true, network: null, protocolIdentifier: null}]
    contactsSpy.isBookEnabled.and.returnValue(firstValueFrom(of(true)))
    contactsSpy.isAddressInContacts.and.returnValue(true)
    
    expect(component).toBeTruthy()
    expect(contactsSpy.isBookEnabled).toHaveBeenCalled()
    expect(contactsSpy.isAddressInContacts).toHaveBeenCalled()
  })
})
