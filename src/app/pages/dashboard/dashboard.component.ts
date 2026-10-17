import { Component, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { ReferenceSystemService }
  from '../../core/services/reference-system.service';
import { AuthService } from '../../core/services/auth.service';
import { OperationWorkbenchComponent } from '../../components/operation-workbench/operation-workbench.component';
import { ResearchAnalyticsComponent } from '../../components/research-analytics/research-analytics.component';
import { DecisionAnalyticsService } from '../../core/services/decision-analytics.service';

import { ReferenceSystem }
  from '../../core/models/reference-system.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, OperationWorkbenchComponent, ResearchAnalyticsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  readonly system = signal<ReferenceSystem | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly sidebarCollapsed = signal(false);

  constructor(
    private referenceSystemService: ReferenceSystemService,
    public authService: AuthService,
    private analytics: DecisionAnalyticsService,
    private router: Router
  ) {
    effect(() => {
      if (!this.authService.authenticated()) {
        this.system.set(null);
        this.analytics.clearLocal();
      }
    });
  }

  ngOnInit(): void {
    this.loadReferenceSystem();
    this.analytics.refresh().subscribe({ error: () => {} });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }

  getSubsystemMatrix(referenceSystem: ReferenceSystem) {
    return (referenceSystem.registeredSubsystems ?? []).map((subsystem) => ({
      ...subsystem,
      intents: (referenceSystem.validIntents ?? [])
        .filter((entry) => entry.subsystemId === subsystem.subsystemId)
        .map((entry) => entry.intent),
      commands: (referenceSystem.validCommands ?? [])
        .filter((entry) => entry.subsystemId === subsystem.subsystemId)
        .map((entry) => entry.command)
    }));
  }

  loadReferenceSystem(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.referenceSystemService
      .getReferenceSystem()
      .subscribe({

        next: (response) => {
          this.system.set(this.authService.isAuthenticated() ? response : null);
          this.loading.set(false);
        },

        error: () => {
          this.errorMessage.set('Unable to load Reference System. Check your connection and try again.');
          this.loading.set(false);
        }

      });
  }

  logout(): void {
    this.authService.logout();
    this.system.set(null);
    void this.router.navigateByUrl('/login');
  }
}
