import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigComponent } from './config.component';
import { FilialesCrudComponent } from './filiales-crud/filiales-crud.component';
import { UsuariosNewComponent } from './usuarios-new/usuarios-new.component';
import { TipoDocumentoCrudComponent } from './tipo-documento-crud/tipo-documento-crud.component';
import { StatusCrudComponent } from './status-crud/status-crud.component';
import { TipoServicioCrudComponent } from './tipo-servicio-crud/tipo-servicio-crud.component';
import { TipoAtaudCrudComponent } from './tipo-ataud-crud/tipo-ataud-crud.component';
import { MotivoNoOtorgadoCrudComponent } from './motivo-no-otorgado-crud/motivo-no-otorgado-crud.component';
import { EstadoCtaStatusCrudComponent } from './estado-cta-status-crud/estado-cta-status-crud.component';
import { UsuariosComponent } from './usuarios/usuarios.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'grupos',
    pathMatch: 'full',
  },
  { path: 'filiales-admin', component: FilialesCrudComponent },
  { path: 'tipo-documento-admin', component: TipoDocumentoCrudComponent },
  { path: 'tipo-servicio-admin', component: TipoServicioCrudComponent },
  { path: 'tipo-ataud-admin', component: TipoAtaudCrudComponent },
  { path: 'motivo-no-otorgado-admin', component: MotivoNoOtorgadoCrudComponent },
  { path: 'estado-cta-status-admin', component: EstadoCtaStatusCrudComponent },

  { path: 'status-admin', component: StatusCrudComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'usuarios/:id', component: UsuariosNewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfigRoutingModule {}
