import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServicioCrudComponent } from './servicios-crud/servicio-crud.component';

const routes: Routes = [
  { path: '', component: ServicioCrudComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServiciosRoutingModule { }
