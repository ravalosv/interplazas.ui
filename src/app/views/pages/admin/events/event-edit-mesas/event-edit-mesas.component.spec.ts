import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventEditMesasComponent } from './event-edit-mesas.component';

describe('EventEditMesasComponent', () => {
  let component: EventEditMesasComponent;
  let fixture: ComponentFixture<EventEditMesasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventEditMesasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventEditMesasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
