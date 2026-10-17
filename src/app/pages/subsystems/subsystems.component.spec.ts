import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { throwError } from 'rxjs';
import { SubsystemsComponent } from './subsystems.component';
import { ReferenceSystemService } from '../../core/services/reference-system.service';

describe('SubsystemsComponent', () => {
  let component: SubsystemsComponent;
  let fixture: ComponentFixture<SubsystemsComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubsystemsComponent],
      providers: [provideRouter([]), { provide: ReferenceSystemService, useValue: { getReferenceSystem: () => throwError(() => new Error()) } }]
    }).compileComponents();
    fixture = TestBed.createComponent(SubsystemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('shows a recoverable error when the catalog is unavailable', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Unable to load');
  });
});
