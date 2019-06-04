import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretEditPage } from './secret-edit.page';

describe('SecretEditPage', () => {
  let component: SecretEditPage;
  let fixture: ComponentFixture<SecretEditPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecretEditPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecretEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
