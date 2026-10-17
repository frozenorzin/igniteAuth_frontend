import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { OperationWorkbenchComponent } from './operation-workbench.component';
import { AuthService } from '../../core/services/auth.service';
import { CpcIdService } from '../../core/services/cpc-id.service';
import { ControlPlaneService } from '../../core/services/control-plane.service';
import { SimulationService } from '../../core/services/simulation.service';
import { DecisionAnalyticsService } from '../../core/services/decision-analytics.service';

describe('OperationWorkbenchComponent', () => {
  it('requests a decision without a CPC ID and accepts the ID issued in the response', () => {
    const decide = jasmine.createSpy('decide').and.returnValue(of({ cpcId: 42, subSystem: 'GPIO', intent: 'IntentHash1', command: 'ReadPinState', decision: 'Allow', reasonCode: 'ALLOW_VALIDATED', message: 'Allowed', timeStamp: '2026-01-01T00:00:00Z' }));
    const activeId = signal<number | null>(null);
    TestBed.configureTestingModule({ imports: [OperationWorkbenchComponent], providers: [
      { provide: AuthService, useValue: { session: signal({ authenticated: true, username: 'test', role: 'User' }), sessionError: signal('') } },
      { provide: CpcIdService, useValue: { activeId, acceptIssuedId: (id: number) => activeId.set(id) } },
      { provide: ControlPlaneService, useValue: { decide } },
      { provide: DecisionAnalyticsService, useValue: { refresh: () => of(void 0) } },
      SimulationService
    ] });
    const component = TestBed.createComponent(OperationWorkbenchComponent).componentInstance;
    component.system = { referenceSystemId: 1, systemName: 'STM32', systemType: '', systemVersion: '', description: '', status: '', createdAt: '',
      registeredSubsystems: [{ subsystemId: 'GPIO', name: 'GPIO' }],
      intentCommandMappings: [{ subsystemId: 'GPIO', intent: 'IntentHash1', commands: ['ReadPinState'] }] };
    component.execute(component.cards()[0]);
    expect(decide).toHaveBeenCalledWith(jasmine.objectContaining({ subSystem: 'GPIO' }));
    expect(decide.calls.mostRecent().args[0].cpcId).toBeUndefined();
    expect(activeId()).toBe(42);
    expect(component.history()[0].decision).toBe('ALLOW');
  });

  it('submits free-form values and records a denied backend response without simulation', () => {
    const decide = jasmine.createSpy('decide').and.returnValue(of({ cpcId: 42, subSystem: 'GPIO', intent: 'DiagnosticIntent', command: 'InspectPin', decision: 'Deny', reasonCode: 'INTENT_INVALID', message: 'Denied', timeStamp: '2026-01-01T00:00:00Z' }));
    TestBed.configureTestingModule({ imports: [OperationWorkbenchComponent], providers: [
      { provide: AuthService, useValue: { session: signal({ authenticated: true, username: 'test', role: 'User' }), sessionError: signal('') } },
      { provide: CpcIdService, useValue: { activeId: signal(42), acceptIssuedId: () => {} } },
      { provide: ControlPlaneService, useValue: { decide } },
      { provide: DecisionAnalyticsService, useValue: { refresh: () => of(void 0) } },
      SimulationService
    ] });
    const component = TestBed.createComponent(OperationWorkbenchComponent).componentInstance;
    component.system = { referenceSystemId: 1, systemName: 'STM32', systemType: '', systemVersion: '', description: '', status: '', createdAt: '',
      registeredSubsystems: [{ subsystemId: 'GPIO', name: 'GPIO' }],
      intentCommandMappings: [{ subsystemId: 'GPIO', intent: 'IntentHash1', commands: ['ReadPinState'] }] };
    component.cards()[0].form.setValue({ intent: '  DiagnosticIntent  ', command: '  InspectPin  ' });
    component.execute(component.cards()[0]);
    expect(decide).toHaveBeenCalledWith(jasmine.objectContaining({ intent: 'DiagnosticIntent', command: 'InspectPin' }));
    expect(component.history()[0].decision).toBe('DENY');
    expect(component.history()[0].output.join(' ')).toContain('No simulated hardware operation executed');
  });
});
