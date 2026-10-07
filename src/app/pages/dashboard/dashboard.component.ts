import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReferenceSystemService }
  from '../../core/services/reference-system.service';

import { ReferenceSystem }
  from '../../core/models/reference-system.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  system?: ReferenceSystem;

  loading = true;
  errorMessage = '';

  constructor(
    private referenceSystemService: ReferenceSystemService
  ) {}

  ngOnInit(): void {

    this.referenceSystemService
      .getReferenceSystem()
      .subscribe({

        next: (response) => {
          this.system = response;
          this.loading = false;
        },

        error: (error) => {
          console.error(error);

          this.errorMessage =
            'Unable to load Reference System.';

          this.loading = false;
        }

      });
  }
}