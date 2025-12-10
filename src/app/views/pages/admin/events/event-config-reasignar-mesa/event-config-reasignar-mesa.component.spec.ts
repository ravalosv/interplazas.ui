import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventConfigReasignarMesaComponent } from './event-config-reasignar-mesa.component';

describe('EventConfigReasignarMesaComponent', () => {
  let component: EventConfigReasignarMesaComponent;
  let fixture: ComponentFixture<EventConfigReasignarMesaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventConfigReasignarMesaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventConfigReasignarMesaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
