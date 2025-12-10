import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvisosEditComponent } from './avisos-edit.component';

describe('AvisosEditComponent', () => {
  let component: AvisosEditComponent;
  let fixture: ComponentFixture<AvisosEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvisosEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvisosEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
