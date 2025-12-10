import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidadesNegocioComponent } from './unidades-negocio.component';

describe('UnidadesNegocioComponent', () => {
  let component: UnidadesNegocioComponent;
  let fixture: ComponentFixture<UnidadesNegocioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnidadesNegocioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnidadesNegocioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
