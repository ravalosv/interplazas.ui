import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitadosHabitacionComponent } from './invitados-habitacion.component';

describe('InvitadosHabitacionComponent', () => {
  let component: InvitadosHabitacionComponent;
  let fixture: ComponentFixture<InvitadosHabitacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvitadosHabitacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitadosHabitacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
