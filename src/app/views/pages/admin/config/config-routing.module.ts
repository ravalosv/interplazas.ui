import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigComponent } from './config.component';
import { GruposComponent } from './grupos/grupos.component';
import { UnidadesNegocioComponent } from './unidades-negocio/unidades-negocio.component';
import { FilialesComponent } from './filiales/filiales.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { UsuariosNewComponent } from './usuarios-new/usuarios-new.component';
import { EstructuraComponent } from './estructura/estructura.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'grupos',
    pathMatch: 'full',
  },
  { path: 'estructura', component: EstructuraComponent },
  { path: 'grupos', component: GruposComponent },
  { path: 'unidades-negocio', component: UnidadesNegocioComponent },
  { path: 'filiales', component: FilialesComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'usuarios/:id', component: UsuariosNewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfigRoutingModule {}
