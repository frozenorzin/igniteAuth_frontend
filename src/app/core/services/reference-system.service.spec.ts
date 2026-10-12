import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ReferenceSystemService } from './reference-system.service';

describe('ReferenceSystemService', () => {
  let service: ReferenceSystemService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ReferenceSystemService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('requests the backend Reference System endpoint', () => {
    service.getReferenceSystem().subscribe();
    const request = httpTestingController.expectOne('/api/referencesystem');

    expect(request.request.method).toBe('GET');
    request.flush({});
  });
});
