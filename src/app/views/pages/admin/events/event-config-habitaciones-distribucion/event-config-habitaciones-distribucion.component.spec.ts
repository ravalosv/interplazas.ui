import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventConfigHabitacionesDistribucionComponent } from './event-config-habitaciones-distribucion.component';

describe('EventConfigHabitacionesDistribucionComponent', () => {
  let component: EventConfigHabitacionesDistribucionComponent;
  let fixture: ComponentFixture<EventConfigHabitacionesDistribucionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventConfigHabitacionesDistribucionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventConfigHabitacionesDistribucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
