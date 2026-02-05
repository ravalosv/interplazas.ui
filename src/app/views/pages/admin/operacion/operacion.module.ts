import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicioCrudComponent } from './servicios-crud/servicio-crud.component';
import { PeriodosComponent } from './periodos/periodos.component';
import { CedulasComponent } from './cedulas/cedulas.component';
import { CedulaDetalleComponent } from './cedulas/cedula-detalle.component';
import { EstadoCuentaComponent } from './estado-cuenta/estado-cuenta.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { OperacionRoutingModule } from './operacion-routing.module';
import { WebdatarocksPivotModule } from '@webdatarocks/ngx-webdatarocks';

@NgModule({
  declarations: [
    ServicioCrudComponent,
    PeriodosComponent,
    CedulasComponent,
    CedulaDetalleComponent,
    EstadoCuentaComponent,
  ],
  imports: [
    CommonModule,
    OperacionRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbModule,
    NgZorroModule,
    WebdatarocksPivotModule,
  ],
})
export class OperacionModule {

}
