import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecretSeedqrTemplatePage } from './secret-seedqr-template.page';

describe('SecretSeedqrTemplatePage', () => {
  let component: SecretSeedqrTemplatePage;
  let fixture: ComponentFixture<SecretSeedqrTemplatePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SecretSeedqrTemplatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
