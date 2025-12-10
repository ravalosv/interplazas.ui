import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilialesComponent } from './filiales.component';

describe('FilialesComponent', () => {
  let component: FilialesComponent;
  let fixture: ComponentFixture<FilialesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilialesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
