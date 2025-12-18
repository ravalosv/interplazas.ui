import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServicioCrudComponent } from './servicios-crud/servicio-crud.component';
import { PeriodosComponent } from './periodos/periodos.component';

const routes: Routes = [
  { path: '', component: ServicioCrudComponent },
  { path: 'servicios', component: ServicioCrudComponent },
  { path: 'periodos', component: PeriodosComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperacionRoutingModule { }
