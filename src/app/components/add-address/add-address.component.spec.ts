import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { AddAddressComponent } from './add-address.component'
import { provideMockStore } from '@ngrx/store/testing'
import { NavigationService } from 'src/app/services/navigation/navigation.service'
import { ContactsService } from 'src/app/services/contacts/contacts.service'

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
})
