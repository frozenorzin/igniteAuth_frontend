import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReferenceSystem } from '../../core/models/reference-system.model';
import { ReferenceSystemService } from '../../core/services/reference-system.service';
import { OperationWorkbenchComponent } from '../../components/operation-workbench/operation-workbench.component';

@Component({
  selector: 'app-subsystems', standalone: true,
  imports: [RouterLink, OperationWorkbenchComponent],
  templateUrl: './subsystems.component.html', styleUrl: './subsystems.component.css'
})
export class SubsystemsComponent implements OnInit {
  readonly system = signal<ReferenceSystem | null>(null);
  readonly error = signal('');
  constructor(private reference: ReferenceSystemService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.error.set('');
    this.reference.getReferenceSystem().subscribe({
      next: system => this.system.set(system),
      error: () => this.error.set('Unable to load the reference system. Check the API connection.')
    });
  }
}
