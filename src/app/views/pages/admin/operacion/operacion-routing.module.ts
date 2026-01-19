import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServicioCrudComponent } from './servicios-crud/servicio-crud.component';
import { PeriodosComponent } from './periodos/periodos.component';
import { CedulasComponent } from './cedulas/cedulas.component';
import { CedulaDetalleComponent } from './cedulas/cedula-detalle.component';

const routes: Routes = [
  { path: '', component: ServicioCrudComponent },
  { path: 'servicios', component: ServicioCrudComponent },
  { path: 'periodos', component: PeriodosComponent },
  { path: 'cedulas', component: CedulasComponent },
  { path: 'cedulas/:id', component: CedulaDetalleComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OperacionRoutingModule {}
