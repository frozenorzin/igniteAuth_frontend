import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { IntentCommandMapping, ReferenceSystem } from '../../core/models/reference-system.model';
import { AuthService } from '../../core/services/auth.service';
import { ControlPlaneRequest, ControlPlaneResponse, ControlPlaneService } from '../../core/services/control-plane.service';
import { CpcIdService } from '../../core/services/cpc-id.service';
import { SimulationService } from '../../core/services/simulation.service';
import { DecisionAnalyticsService, DecisionOutcome } from '../../core/services/decision-analytics.service';

type OperationForm = FormGroup<{ intent: FormControl<string>; command: FormControl<string> }>;
interface Card { id: string; name: string; mappings: IntentCommandMapping[]; form: OperationForm; }
interface OperationResult {
  time: string; subsystem: string; target: string; intent: string; command: string; role: string;
  decision: DecisionOutcome; reason: string; message: string; output: readonly string[]; durationMs: number;
}

// This is presentation guidance only. The backend makes the authoritative decision.
const readOnly = new Set([
  'GPIO:ReadPinState', 'ADC:ReadADCChannel', 'Memory:ReadMemoryRegion',
  'FirmwareManager:GetFirmwareVersion', 'SystemMonitor:ReadSystemHealth'
]);

@Component({
  selector: 'app-operation-workbench', standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './operation-workbench.component.html', styleUrl: './operation-workbench.component.css'
})
export class OperationWorkbenchComponent {
  referenceSystemId = 0;
  ignoreError = () => {};
  readonly cards = signal<Card[]>([]);
  readonly history = signal<OperationResult[]>([]);
  readonly latest = signal<Record<string, OperationResult>>({});
  readonly busy = signal(false);
  readonly errorMessage = signal('');

  constructor(private fb: FormBuilder, public auth: AuthService, public cpc: CpcIdService,
    private controlPlane: ControlPlaneService, private simulation: SimulationService,
    private analytics: DecisionAnalyticsService) {}

  @Input({ required: true }) set system(system: ReferenceSystem) {
    this.referenceSystemId = system.referenceSystemId;
    const mappings = system.intentCommandMappings ?? [];
    this.cards.set((system.registeredSubsystems ?? []).map(subsystem => {
      const matching = mappings.filter(mapping => mapping.subsystemId === subsystem.subsystemId);
      return {
        id: subsystem.subsystemId, name: subsystem.name, mappings: matching,
        form: this.fb.nonNullable.group({
          intent: matching[0]?.intent ?? '', command: matching[0]?.commands[0] ?? ''
        })
      };
    }));
  }

  commands(card: Card): string[] {
    return card.mappings.find(mapping => mapping.intent === card.form.controls.intent.value)?.commands ?? [];
  }

  commandSuggestions(card: Card): string[] {
    return [...new Set(card.mappings.flatMap(mapping => mapping.commands))];
  }

  isReadOnly(card: Card): boolean {
    return readOnly.has(`${card.id}:${card.form.controls.command.value}`);
  }

  execute(card: Card): void {
    const session = this.auth.session();
    const { intent, command } = card.form.getRawValue();
    if (this.busy() || !session || !this.referenceSystemId ||
        !intent.trim() || !command.trim()) return;
    const request: ControlPlaneRequest = { referenceSystemId: this.referenceSystemId,
      subSystemId: card.id, subSystem: card.id, intent: intent.trim(), command: command.trim() };
    const started = performance.now();
    this.busy.set(true);
    this.errorMessage.set('');
    this.controlPlane.decide(request).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: response => this.record(request, response, session.role, performance.now() - started),
      error: (error: unknown) => {
        this.errorMessage.set(error instanceof HttpErrorResponse && error.status === 403
          ? 'Access forbidden by the backend.' : 'Decision request failed. No simulated operation was executed.');
      }
    });
  }

  private record(request: ControlPlaneRequest, response: ControlPlaneResponse, role: string, elapsed: number): void {
    const output = this.simulation.run(request, response);
    const hasIssuedCpcId = Number.isSafeInteger(response.cpcId) && response.cpcId > 0;
    const matches = hasIssuedCpcId && response.subSystem === request.subSystem &&
      response.intent === request.intent && response.command === request.command;
    if (matches) this.cpc.acceptIssuedId(response.cpcId);
    const accepted = response.decision === 'Allow' && matches && output !== null;
    const entry: OperationResult = {
      time: response.timeStamp || new Date().toISOString(), subsystem: request.subSystem, target: request.subSystemId,
      intent: request.intent, command: request.command, role,
      decision: !matches ? 'INVALID RESPONSE' : response.decision === 'Allow' ? 'ALLOW' : response.decision === 'Deny' ? 'DENY' : 'INVALID RESPONSE',
      reason: !matches ? 'RESPONSE_MISMATCH' : response.decision === 'Allow' && !output ? 'SIMULATION_UNAVAILABLE' : response.reasonCode,
      message: response.message, output: accepted ? output : ['No simulated hardware operation executed.'],
      durationMs: Math.round(elapsed)
    };
    this.latest.update(value => ({ ...value, [request.subSystem]: entry }));
    this.history.update(value => [entry, ...value].slice(0, 30));
    this.analytics.refresh().subscribe({ error: () => {} });
  }
}
