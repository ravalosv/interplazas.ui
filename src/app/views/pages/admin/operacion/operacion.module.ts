import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicioCrudComponent } from './servicios-crud/servicio-crud.component';
import { PeriodosComponent } from './periodos/periodos.component';
import { CedulasComponent } from './cedulas/cedulas.component';
import { CedulaDetalleComponent } from './cedulas/cedula-detalle.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { OperacionRoutingModule } from './operacion-routing.module';

@NgModule({
  declarations: [
    ServicioCrudComponent,
    PeriodosComponent,
    CedulasComponent,
    CedulaDetalleComponent,
  ],
  imports: [
    CommonModule,
    OperacionRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbModule,
    NgZorroModule,
  ],
})
export class OperacionModule {}
