import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DecisionAnalyticsService, DecisionOutcome } from '../../core/services/decision-analytics.service';

interface OutcomeBar {
  label: DecisionOutcome;
  count: number;
  percentage: number;
  width: number;
  color: string;
}

@Component({
  selector: 'app-research-analytics',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './research-analytics.component.html',
  styleUrl: './research-analytics.component.css'
})
export class ResearchAnalyticsComponent {
  readonly analytics = inject(DecisionAnalyticsService);
  readonly observations = this.analytics.observations;

  refresh(): void {
    this.analytics.refresh().subscribe({ error: () => {} });
  }

  readonly latency = computed(() => {
    const values = this.observations().slice(-20);
    const maximum = Math.max(1, ...values.map(value => value.latencyMs));
    const plotTop = 18;
    const plotBottom = 196;
    const plotLeft = 56;
    const plotRight = 704;
    const points = values.map((value, index) => ({
      x: values.length === 1
        ? (plotLeft + plotRight) / 2
        : plotLeft + index * ((plotRight - plotLeft) / (values.length - 1)),
      y: plotBottom - (value.latencyMs / maximum) * (plotBottom - plotTop),
      value
    }));
    const ordered = values.map(value => value.latencyMs).sort((a, b) => a - b);
    const mean = values.length
      ? values.reduce((sum, value) => sum + value.latencyMs, 0) / values.length
      : 0;
    const p95Index = Math.max(0, Math.ceil(ordered.length * 0.95) - 1);

    return {
      points,
      polyline: points.map(point => `${point.x},${point.y}`).join(' '),
      maximum,
      mean,
      p95: ordered[p95Index] ?? 0
    };
  });

  readonly outcomes = computed<OutcomeBar[]>(() => {
    const values = this.observations();
    const counts = new Map<DecisionOutcome, number>([
      ['ALLOW', 0], ['DENY', 0], ['INVALID RESPONSE', 0]
    ]);
    values.forEach(value => counts.set(value.outcome, (counts.get(value.outcome) ?? 0) + 1));
    const maximum = Math.max(1, ...counts.values());
    const colors: Record<DecisionOutcome, string> = {
      'ALLOW': '#2dd4bf',
      'DENY': '#fb7185',
      'INVALID RESPONSE': '#fbbf24'
    };

    return [...counts.entries()].map(([label, count]) => ({
      label,
      count,
      percentage: values.length ? (count / values.length) * 100 : 0,
      width: (count / maximum) * 100,
      color: colors[label]
    }));
  });
}
