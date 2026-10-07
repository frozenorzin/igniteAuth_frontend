import { TestBed } from '@angular/core/testing';

import { ControlPlaneService } from './control-plane.service';

describe('ControlPlaneService', () => {
  let service: ControlPlaneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ControlPlaneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
