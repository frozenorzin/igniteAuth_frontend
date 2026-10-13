import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ReferenceSystem } from '../models/reference-system.model';

const referenceSystemFallback: ReferenceSystem = {
  referenceSystemId: 1,
  systemName: 'IgniteAuth Reference System',
  systemType: 'Simple Service Framework',
  systemVersion: 'v0.9',
  description: 'Reference system containing subsystems, policies, intents, commands, and targets.',
  status: 'Active',
  createdAt: '2026-10-13T18:00:38.0043917Z',
  authenticatedUser: { authId: 'admin' },
  registeredSubsystems: [
    { subsystemId: 'ModelService', name: 'ModelService' },
    { subsystemId: 'UserService', name: 'UserService' }
  ],
  validIntents: [
    { subsystemId: 'ModelService', intent: 'IntentHash1' },
    { subsystemId: 'ModelService', intent: 'IntentHash2' },
    { subsystemId: 'ModelService', intent: 'IntentHash3' },
    { subsystemId: 'ModelService', intent: 'IntentHash4' },
    { subsystemId: 'UserService', intent: 'IntentHash5' },
    { subsystemId: 'UserService', intent: 'IntentHash6' }
  ],
  validCommands: [
    { subsystemId: 'ModelService', command: 'CreateModel' },
    { subsystemId: 'ModelService', command: 'DeleteModel' },
    { subsystemId: 'ModelService', command: 'ReadModel' },
    { subsystemId: 'ModelService', command: 'UpdateModel' },
    { subsystemId: 'UserService', command: 'CreateUser' },
    { subsystemId: 'UserService', command: 'DeleteUser' },
    { subsystemId: 'UserService', command: 'ReadUser' },
    { subsystemId: 'UserService', command: 'UpdateUser' }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class ReferenceSystemService {

  private readonly apiUrl =
    '/api/referencesystem';

  constructor(private http: HttpClient) {}

  getReferenceSystem(): Observable<ReferenceSystem> {
    return this.http.get<ReferenceSystem>(this.apiUrl).pipe(
      map((response) => this.normalizeReferenceSystem(response)),
      catchError(() => of(this.normalizeReferenceSystem(referenceSystemFallback)))
    );
  }

  private normalizeReferenceSystem(system: Partial<ReferenceSystem> | null): ReferenceSystem {
    const registeredSubsystems = system?.registeredSubsystems ?? system?.subsystems?.map(item => ({
      subsystemId: String(item.subSystemId),
      name: item.name
    })) ?? [];

    const validIntents = system?.validIntents ?? [];
    const validCommands = system?.validCommands ?? [];

    return {
      referenceSystemId: system?.referenceSystemId ?? 1,
      systemName: system?.systemName ?? 'IgniteAuth Reference System',
      systemType: (system?.systemType ?? 'Simple Service Framework').trim() || 'Simple Service Framework',
      systemVersion: system?.systemVersion ?? 'v0.9',
      description: system?.description ?? 'Reference system containing subsystems, policies, intents, commands, and targets.',
      status: system?.status ?? 'Active',
      createdAt: system?.createdAt ?? new Date().toISOString(),
      authenticatedUser: system?.authenticatedUser ?? { authId: 'admin' },
      registeredSubsystems,
      validIntents,
      validCommands,
      subsystems: system?.subsystems ?? [],
      policies: system?.policies ?? []
    };
  }
}