import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { Bip85ShowPage } from './bip85-show.page';

describe('Bip85ShowPage', () => {
  let component: Bip85ShowPage;
  let fixture: ComponentFixture<Bip85ShowPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Bip85ShowPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Bip85ShowPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
