import { Component, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { ReferenceSystemService }
  from '../../core/services/reference-system.service';
import { AuthService } from '../../core/services/auth.service';

import { ReferenceSystem }
  from '../../core/models/reference-system.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  readonly system = signal<ReferenceSystem | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  constructor(
    private referenceSystemService: ReferenceSystemService,
    private authService: AuthService,
    private router: Router
  ) {
    effect(() => {
      if (!this.authService.authenticated()) {
        this.system.set(null);
      }
    });
  }

  ngOnInit(): void {
    this.loadReferenceSystem();
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