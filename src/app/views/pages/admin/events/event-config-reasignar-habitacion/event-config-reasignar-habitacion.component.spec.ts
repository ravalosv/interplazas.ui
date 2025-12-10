import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventConfigReasignarHabitacionComponent } from './event-config-reasignar-habitacion.component';

describe('EventConfigReasignarHabitacionComponent', () => {
  let component: EventConfigReasignarHabitacionComponent;
  let fixture: ComponentFixture<EventConfigReasignarHabitacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventConfigReasignarHabitacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventConfigReasignarHabitacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
