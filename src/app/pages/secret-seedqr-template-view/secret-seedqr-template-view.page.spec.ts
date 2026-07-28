import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecretSeedqrTemplateViewPage } from './secret-seedqr-template-view.page';

describe('SecretSeedqrTemplateViewPage', () => {
  let component: SecretSeedqrTemplateViewPage;
  let fixture: ComponentFixture<SecretSeedqrTemplateViewPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SecretSeedqrTemplateViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
