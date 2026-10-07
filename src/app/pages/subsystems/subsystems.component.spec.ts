import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubsystemsComponent } from './subsystems.component';

describe('SubsystemsComponent', () => {
  let component: SubsystemsComponent;
  let fixture: ComponentFixture<SubsystemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubsystemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubsystemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
