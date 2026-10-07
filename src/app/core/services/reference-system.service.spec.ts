import { TestBed } from '@angular/core/testing';

import { ReferenceSystemService } from './reference-system.service';

describe('ReferenceSystemService', () => {
  let service: ReferenceSystemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReferenceSystemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
