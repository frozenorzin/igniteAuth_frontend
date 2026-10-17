import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DecisionAnalyticsService } from './decision-analytics.service';

describe('DecisionAnalyticsService', () => {
  let service: DecisionAnalyticsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(DecisionAnalyticsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads persistent observations and preserves the backend sequence window', () => {
    service.refresh(20).subscribe();
    const call = http.expectOne(request => request.url === '/api/analytics' && request.params.get('limit') === '20');
    expect(call.request.method).toBe('GET');
    call.flush({
      generatedAtUtc: '2026-10-17T10:00:00Z',
      totalStoredObservations: 45,
      matchedObservations: 30,
      returnedObservations: 2,
      observations: [
        { recordedAtUtc: '2026-10-17T09:59:00Z', cpcId: 8, subsystem: 'ADC', command: 'ReadADCChannel', decision: 'Allow', reasonCode: 'ALLOW_VALIDATED', durationMs: 1.25 },
        { recordedAtUtc: '2026-10-17T09:59:01Z', cpcId: 9, subsystem: 'ADC', command: 'Unknown', decision: 'Deny', reasonCode: 'COMMAND_INVALID', durationMs: 0.4 }
      ]
    });

    expect(service.totalStored()).toBe(45);
    expect(service.observations().map(value => value.sequence)).toEqual([29, 30]);
    expect(service.observations().map(value => value.outcome)).toEqual(['ALLOW', 'DENY']);
    expect(service.loading()).toBeFalse();
  });

  it('reports API failure without replacing the last valid dataset', () => {
    service.refresh().subscribe({ error: () => {} });
    http.expectOne('/api/analytics?limit=100').flush('unavailable', { status: 503, statusText: 'Unavailable' });

    expect(service.error()).toContain('temporarily unavailable');
    expect(service.loading()).toBeFalse();
  });
});
