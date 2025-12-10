import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventConfigAsignarMesaReservaComponent } from './event-config-asignar-mesa-reserva.component';

describe('EventConfigAsignarMesaReservaComponent', () => {
  let component: EventConfigAsignarMesaReservaComponent;
  let fixture: ComponentFixture<EventConfigAsignarMesaReservaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventConfigAsignarMesaReservaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventConfigAsignarMesaReservaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
