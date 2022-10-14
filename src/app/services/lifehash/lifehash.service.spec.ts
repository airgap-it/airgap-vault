import { TestBed } from '@angular/core/testing';

import { LifehashService } from './lifehash.service';

describe('LifehashService', () => {
  let service: LifehashService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LifehashService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
