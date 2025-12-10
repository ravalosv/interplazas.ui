import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventConfigHabitacionesListComponent } from './event-config-habitaciones-list.component';

describe('EventConfigHabitacionesListComponent', () => {
  let component: EventConfigHabitacionesListComponent;
  let fixture: ComponentFixture<EventConfigHabitacionesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventConfigHabitacionesListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventConfigHabitacionesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
