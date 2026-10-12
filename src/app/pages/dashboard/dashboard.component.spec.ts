import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../core/services/auth.service';
import { ReferenceSystemService } from '../../core/services/reference-system.service';
import { ReferenceSystem } from '../../core/models/reference-system.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  const system: ReferenceSystem = {
    referenceSystemId: 1,
    systemName: 'IgniteAuth Reference System',
    systemType: 'Control Plane Security Framework',
    systemVersion: 'v0.9',
    description: 'Protected API data',
    status: 'Active',
    createdAt: '2026-10-12T00:00:00Z',
    subsystems: [{
      subSystemId: 1,
      referenceSystemId: 1,
      name: 'Embedded-X',
      domain: 'Defense Airborne',
      description: 'Registered subsystem',
      status: 'Active'
    }],
    policies: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            authenticated: signal(true),
            isAuthenticated: () => true,
            logout: jasmine.createSpy('logout')
          }
        },
        {
          provide: ReferenceSystemService,
          useValue: { getReferenceSystem: () => of(system) }
        },
        provideRouter([])
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
    expect(fixture.nativeElement.textContent).toContain('Embedded-X');
  });
});
