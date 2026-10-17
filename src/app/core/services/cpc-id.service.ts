import { Injectable, signal } from '@angular/core';

/** Tracks the most recent CPC ID issued by IgAPI for this browser session. */
@Injectable({ providedIn: 'root' })
export class CpcIdService {
  readonly activeId = signal<number | null>(null);

  acceptIssuedId(cpcId: number): void {
    if (Number.isSafeInteger(cpcId) && cpcId > 0) this.activeId.set(cpcId);
  }
}
