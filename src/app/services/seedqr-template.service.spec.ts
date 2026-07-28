import { TestBed } from '@angular/core/testing';

import { SeedqrTemplateService } from './seedqr-template.service';

describe('SeedqrTemplateService', () => {
  let service: SeedqrTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeedqrTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
