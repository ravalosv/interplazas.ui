import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigComponent } from './config.component';
import { FilialesCrudComponent } from './filiales-crud/filiales-crud.component';
import { UsuariosNewComponent } from './usuarios-new/usuarios-new.component';
import { TipoDocumentoCrudComponent } from './tipo-documento-crud/tipo-documento-crud.component';
import { StatusCrudComponent } from './status-crud/status-crud.component';
import { TipoServicioCrudComponent } from './tipo-servicio-crud/tipo-servicio-crud.component';
import { ConceptoCrudComponent } from './concepto-crud/concepto-crud.component';
import { MotivoNoOtorgadoCrudComponent } from './motivo-no-otorgado-crud/motivo-no-otorgado-crud.component';
import { EstadoCtaStatusCrudComponent } from './estado-cta-status-crud/estado-cta-status-crud.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { GruposCrudComponent } from './grupos-crud/grupos-crud.component';
import { SucursalesCrudComponent } from './sucursales-crud/sucursales-crud.component';
import { CanalesComunicacionCrudComponent } from './canales-comunicacion-crud/canales-comunicacion-crud.component';
import { EmailTemplateCrudComponent } from './email-template-crud/email-template-crud.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'grupos-admin',
    pathMatch: 'full',
  },
  { path: 'grupos-admin', component: GruposCrudComponent },
  { path: 'filiales-admin', component: FilialesCrudComponent },
  { path: 'sucursales-admin', component: SucursalesCrudComponent },
  { path: 'tipo-documento-admin', component: TipoDocumentoCrudComponent },
  { path: 'tipo-servicio-admin', component: TipoServicioCrudComponent },
  { path: 'concepto-crud', component: ConceptoCrudComponent },
  { path: 'motivo-no-otorgado-admin', component: MotivoNoOtorgadoCrudComponent },
  { path: 'estado-cta-status-admin', component: EstadoCtaStatusCrudComponent },
  { path: 'canales-comunicacion-admin', component: CanalesComunicacionCrudComponent },
  { path: 'email-templates-admin', component: EmailTemplateCrudComponent },

  { path: 'status-admin', component: StatusCrudComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'usuarios/:id', component: UsuariosNewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfigRoutingModule {}
