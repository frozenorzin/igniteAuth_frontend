import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ControlPlaneComponent } from './control-plane.component';

describe('ControlPlaneComponent', () => {
  let component: ControlPlaneComponent;
  let fixture: ComponentFixture<ControlPlaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlPlaneComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlPlaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
