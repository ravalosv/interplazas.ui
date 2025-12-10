import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvisosListComponent } from './avisos-list.component';

describe('AvisosListComponent', () => {
  let component: AvisosListComponent;
  let fixture: ComponentFixture<AvisosListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvisosListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvisosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
