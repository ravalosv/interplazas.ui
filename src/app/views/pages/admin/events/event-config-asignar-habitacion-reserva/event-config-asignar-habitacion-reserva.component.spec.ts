import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventConfigAsignarHabitacionReservaComponent } from './event-config-asignar-habitacion-reserva.component';

describe('EventConfigAsignarHabitacionReservaComponent', () => {
  let component: EventConfigAsignarHabitacionReservaComponent;
  let fixture: ComponentFixture<EventConfigAsignarHabitacionReservaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventConfigAsignarHabitacionReservaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventConfigAsignarHabitacionReservaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
