import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { Bip85VerifyPage } from './bip85-verify.page';

describe('Bip85VerifyPage', () => {
  let component: Bip85VerifyPage;
  let fixture: ComponentFixture<Bip85VerifyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Bip85VerifyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Bip85VerifyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
