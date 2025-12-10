import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventEditHabitacionesComponent } from './event-edit-habitaciones.component';

describe('EventEditHabitacionesComponent', () => {
  let component: EventEditHabitacionesComponent;
  let fixture: ComponentFixture<EventEditHabitacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventEditHabitacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventEditHabitacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
