import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

export type DecisionOutcome = 'ALLOW' | 'DENY' | 'INVALID RESPONSE';

export interface DecisionObservation {
  sequence: number;
  cpcId: number | null;
  subsystem: string;
  command: string;
  outcome: DecisionOutcome;
  reasonCode: string;
  latencyMs: number;
  observedAt: string;
}

interface AnalyticsApiObservation {
  recordedAtUtc: string;
  cpcId: number;
  subsystem: string;
  command: string;
  decision: string;
  reasonCode: string;
  durationMs: number;
}

interface AnalyticsApiResponse {
  generatedAtUtc: string;
  totalStoredObservations: number;
  matchedObservations: number;
  returnedObservations: number;
  observations: AnalyticsApiObservation[];
}

@Injectable({ providedIn: 'root' })
export class DecisionAnalyticsService {
  private readonly values = signal<readonly DecisionObservation[]>([]);
  readonly observations = this.values.asReadonly();
  readonly loading = signal(false);
  readonly error = signal('');
  readonly totalStored = signal(0);
  readonly generatedAtUtc = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  refresh(limit = 100): Observable<void> {
    this.loading.set(true);
    this.error.set('');
    return this.http.get<AnalyticsApiResponse>('/api/analytics', { params: { limit } }).pipe(
      tap(response => {
        const start = Math.max(0, response.matchedObservations - response.returnedObservations);
        this.values.set((response.observations ?? []).map((value, index) => ({
          sequence: start + index + 1,
          cpcId: value.cpcId > 0 ? value.cpcId : null,
          subsystem: value.subsystem,
          command: value.command,
          outcome: value.decision.toUpperCase() === 'ALLOW' ? 'ALLOW'
            : value.decision.toUpperCase() === 'DENY' ? 'DENY' : 'INVALID RESPONSE',
          reasonCode: value.reasonCode,
          latencyMs: value.durationMs,
          observedAt: value.recordedAtUtc
        })));
        this.totalStored.set(response.totalStoredObservations ?? 0);
        this.generatedAtUtc.set(response.generatedAtUtc ?? null);
      }),
      map(() => void 0),
      tap({
        error: () => {
          this.error.set('Persistent analytics are temporarily unavailable.');
          this.loading.set(false);
        },
        complete: () => this.loading.set(false)
      })
    );
  }

  clearLocal(): void {
    this.values.set([]);
    this.totalStored.set(0);
    this.generatedAtUtc.set(null);
    this.error.set('');
  }
}
