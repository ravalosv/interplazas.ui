import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitadoEditComponent } from './invitado-edit.component';

describe('InvitadoEditComponent', () => {
  let component: InvitadoEditComponent;
  let fixture: ComponentFixture<InvitadoEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvitadoEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitadoEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
