import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AvisosListComponent } from './avisos-list/avisos-list.component';
import { AvisosEditComponent } from './avisos-edit/avisos-edit.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'avisos',
    pathMatch: 'full',
  },
  { path: 'avisos', component: AvisosListComponent },
  { path: 'avisos/:id', component: AvisosEditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ToolsRoutingModule {}
