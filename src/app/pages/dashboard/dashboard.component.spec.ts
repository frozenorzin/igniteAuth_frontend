import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../core/services/auth.service';
import { ReferenceSystemService } from '../../core/services/reference-system.service';
import { ReferenceSystem } from '../../core/models/reference-system.model';
import { DecisionAnalyticsService } from '../../core/services/decision-analytics.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  const system: ReferenceSystem = {
    referenceSystemId: 1,
    systemName: 'IgniteAuth Reference System',
    systemType: ' Simple Service Framework',
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
      { subsystemId: 'UserService', intent: 'IntentHash5' }
    ],
    validCommands: [
      { subsystemId: 'ModelService', command: 'CreateModel' },
      { subsystemId: 'UserService', command: 'CreateUser' }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            authenticated: signal(true),
            session: signal({ authenticated: true, username: 'admin', role: 'Admin' }),
            isAuthenticated: () => true,
            logout: jasmine.createSpy('logout')
          }
        },
        {
          provide: ReferenceSystemService,
          useValue: { getReferenceSystem: () => of(system) }
        },
        {
          provide: DecisionAnalyticsService,
          useValue: {
            observations: signal([]),
            totalStored: signal(0),
            loading: signal(false),
            error: signal(''),
            refresh: () => of(void 0),
            clearLocal: jasmine.createSpy('clearLocal')
          }
        },
        provideRouter([]),
        provideHttpClient()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('IgniteAuth Reference System');
    expect(fixture.nativeElement.textContent).toContain('ModelService');
    expect(fixture.nativeElement.textContent).toContain('IntentHash1');
  });

  it('should hide and reveal the side panel', () => {
    const shell = fixture.nativeElement.querySelector('.system-shell');
    const toggle = fixture.nativeElement.querySelector('.sidebar-toggle') as HTMLButtonElement;

    expect(toggle.getAttribute('aria-label')).toBe('Hide side panel');
    expect(shell.classList.contains('sidebar-collapsed')).toBe(false);

    toggle.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-label')).toBe('Reveal side panel');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(shell.classList.contains('sidebar-collapsed')).toBe(true);

    toggle.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-label')).toBe('Hide side panel');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(shell.classList.contains('sidebar-collapsed')).toBe(false);
  });
});
