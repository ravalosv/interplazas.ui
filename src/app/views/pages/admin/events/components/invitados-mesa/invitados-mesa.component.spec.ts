import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitadosMesaComponent } from './invitados-mesa.component';

describe('InvitadosMesaComponent', () => {
  let component: InvitadosMesaComponent;
  let fixture: ComponentFixture<InvitadosMesaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvitadosMesaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitadosMesaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
