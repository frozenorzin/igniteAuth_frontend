import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ControlPlaneService } from './control-plane.service';

describe('ControlPlaneService', () => {
  it('uses the decision endpoint with the exact request', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const service = TestBed.inject(ControlPlaneService);
    const http = TestBed.inject(HttpTestingController);
    const request = { referenceSystemId: 1, subSystemId: 'GPIO', subSystem: 'GPIO', intent: 'IntentHash1', command: 'ReadPinState' };
    service.decide(request).subscribe();
    const call = http.expectOne('/api/ControlPlane/decide');
    expect(call.request.method).toBe('POST');
    expect(call.request.body).toEqual(request);
    call.flush({ decision: 'Deny' });
    http.verify();
  });
});
