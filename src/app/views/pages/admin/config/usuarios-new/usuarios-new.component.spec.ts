import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosNewComponent } from './usuarios-new.component';

describe('UsuariosNewComponent', () => {
  let component: UsuariosNewComponent;
  let fixture: ComponentFixture<UsuariosNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsuariosNewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
